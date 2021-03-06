const { Router } = require('express');
const axios = require('axios');
const {
  rfOn,
  rfOff,
  setPower,
  setAnalyzer,
  resetAnalyzer,
  getPower,
  writeCsv,
  readCsv,
  getDateLastModified,
  promiseTimeout,
} = require('../util/utils');
const port = require('../util/port');
const { inOperation, outOperation } = require('../ping/index');

const httpReq = axios.create();

httpReq.defaults.timeout = 500;

const get = (p, hard = false, tries = 0) =>
  new Promise(async (resolve, reject) => {
    try {
      resolve(await p);
    } catch (e) {
      if (tries >= 5) {
        if (hard) reject();
        else resolve();
      } else {
        resolve(get(p, hard, tries + 1));
      }
    }
  });

const api = Router();

api.post('/close_port', async (req, res) => {
  if (port.connected) {
    await port.disconnect();
  }
  res.sendStatus(201);
});

api.get('/sweep', async (req, res) => {
  const { type } = req.query;
  let { channel, startPower, endPower } = req.query;
  inOperation();
  channel = +channel;
  startPower = +startPower;
  endPower = +endPower;
  const frequency = [1.25, 2.25, 4, 7.5, 15][channel - 1];
  const dataOffset = [0.6, 0.8, 1.1, 1.8, 2.8][channel - 1];
  const powerDataOffset = type === 'high' ? [20, 20, 26, 23, 17.5][channel - 1] : 0;

  const data = [];
  await setAnalyzer(frequency);
  await rfOn();
  const sweep = async power => {
    if (power > endPower) return;
    await setPower(frequency, power);
    // Wait 10 milliseconds for systems to respond
    await new Promise(resolve => setTimeout(resolve, 10));
    const dBm = await getPower();
    data.push([power + powerDataOffset, dBm + dataOffset]);
    // If the dBm return value goes above -10 dBm, turn the rf off and stop the sweep
    if (dBm >= -10) {
      await rfOff();
      return;
    }
    await sweep(power + 0.25);
  };
  await sweep(startPower);
  await setPower(frequency, -20);
  await rfOff();
  await resetAnalyzer();
  let temperature = null;
  const gt = async () => {
    temperature = await port.connection.writeCommand('TA000', tempData => tempData.split('x')[1].trim());
  };
  const getTemp = async () => {
    await promiseTimeout(gt(), 500);
  };
  if (!port.connected) {
    try {
      const {
        data: { temperature: temp },
      } = await get(httpReq.get('http://localhost:3300/api/temp'), 'hard');
      temperature = temp;
    } catch (e) {
      if (await port.connect()) {
        await get(getTemp());
      }
    }
  } else {
    await get(getTemp());
  }
  outOperation();
  res.status(200).send({ sweep: data, temperature });
});

api
  .route('/sweep/data')
  .post(async (req, res) => {
    const { channel, sweep, unit, type } = req.body;
    try {
      await writeCsv(channel, sweep, unit, type);
      res.sendStatus(201);
    } catch (e) {
      res.status(400).send(e);
    }
  })
  .get(async (req, res) => {
    const { channel, unit } = req.query;
    let low = [];
    let high = [];
    let dateLow = null;
    let dateHigh = null;
    try {
      low = await readCsv(channel, unit, 'low');
      dateLow = await getDateLastModified(channel, unit, 'low');
    } catch (e) {} // eslint-disable-line no-empty
    try {
      high = await readCsv(channel, unit, 'high');
      dateHigh = await getDateLastModified(channel, unit, 'high');
    } catch (e) {} // eslint-disable-line no-empty
    const data = low.concat(high);
    const date = [dateLow, dateHigh].sort((a, b) => a < b)[0];
    res
      .status(200)
      .send({ data, date: date ? `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}` : null });
  });

module.exports = api;
