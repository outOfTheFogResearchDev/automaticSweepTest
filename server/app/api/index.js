const { Router } = require('express');
const { rfOn, rfOff, setPower, setAnalyzer, resetAnalyzer, getPower, writeCsv, readCsv } = require('../util/utils');

const api = Router();

api.get('/sweep', async (req, res) => {
  const { type } = req.query;
  let { channel, startPower, endPower } = req.query;
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
  res.send({ sweep: data });
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
    try {
      low = await readCsv(channel, unit, 'low');
    } catch (e) {} // eslint-disable-line no-empty
    try {
      high = await readCsv(channel, unit, 'high');
    } catch (e) {} // eslint-disable-line no-empty
    const data = low.concat(high);
    res.status(200).send({ data });
  });

module.exports = api;
