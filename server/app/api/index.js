const { Router } = require('express');
const { writeCsv, readCsv } = require('../util/utils');

const api = Router();

api.post('/sweep', async (req, res) => {
  const { channel, data, unit, type } = req.body;
  try {
    await writeCsv(channel, data, unit, type);
    res.sendStatus(201);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = api;
