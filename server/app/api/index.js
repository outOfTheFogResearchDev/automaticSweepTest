const { Router } = require('express');
const { rfOn, rfOff, setPower, setAnalyzer, resetAnalyzer, getPower, writeCsv, readCsv } = require('../util/utils');

const api = Router();

api.get('/sweep', async (req, res) => {
  let { frequency, startPower, endPower } = req.query;
  frequency = +frequency;
  startPower = +startPower;
  endPower = +endPower;
  const data = [];
  await setAnalyzer(frequency);
  await rfOn();
  const sweep = async power => {
    if (power > endPower) return;
    await setPower(frequency, power);
    // Wait 2 milliseconds for systems to respond
    await new Promise(resolve => setTimeout(resolve, 2));
    const dBm = await getPower();
    data.push([power, dBm]);
    // If the dBm return value goes above -10 dBm, turn the rf off and stop the sweep
    if (dBm >= -10) {
      await rfOff();
      return;
    }
    await sweep(power + 0.25);
  };
  await sweep(startPower);
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
