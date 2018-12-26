const { Router } = require('express');
const { rfOn, rfOff, setPower, getPower, writeCsv, readCsv } = require('../util/utils');

const api = Router();

api.post('/rf', async (req, res) => {
  const { on } = req.body;
  try {
    await (on ? rfOn() : rfOff());
    res.sendStatus(201);
  } catch (e) {
    res.status(400).send(e);
  }
});

api
  .route('/power')
  .post(async (req, res) => {
    const { power } = req.body;
    try {
      await setPower(power);
      res.sendStatus(201);
    } catch (e) {
      res.status(400).send(e);
    }
  })
  .get(async (req, res) => {
    try {
      const power = await getPower();
      res.status(200).send({ power });
    } catch (e) {
      res.status(400).send(e);
    }
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
    try {
      const low = await readCsv(channel, unit, 'low');
      const high = await readCsv(channel, unit, 'high');
      const sweep = low.concat(high);
      res.status(200).send({ sweep });
    } catch (e) {
      res.status(400).send(e);
    }
  });

module.exports = api;
