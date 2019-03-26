const { Router } = require('express');
const port = require('../util/port');

const ping = Router();

const gracefulShutdown = async () => {
  if (port.connected) await port.disconnect();
  process.exit();
};

let pinged = false;
let operating = false;
const inOperation = () => {
  operating = true;
  pinged = true;
};
const outOperation = () => {
  operating = false;
  pinged = true;
};

const timedExit = async () => {
  if (!pinged) gracefulShutdown();
  else {
    if (!operating) pinged = false;
    setTimeout(timedExit, 2000);
  }
};

setTimeout(timedExit, 10000); // starts on server start

ping.post('/', (req, res) => {
  pinged = true;
  res.sendStatus(201);
});

ping.post('/in_operation', (req, res) => {
  inOperation();
  res.sendStatus(201);
});

ping.post('/out_operation', (req, res) => {
  outOperation();
  res.sendStatus(201);
});

module.exports = { ping, inOperation, outOperation };
