const SerialPort = require('serialport');
const openPort = require('./openPort');

async function connect() {
  try {
    const [{ comName }] = await SerialPort.list();
    this.connection = await openPort(comName);
    this.connected = true;
    return true;
  } catch (e) {
    return false;
  }
}

async function disconnect() {
  await new Promise(resolve => this.connection.close(resolve));
  this.connection = {};
  this.connected = false;
}

module.exports = {
  connected: false,
  connection: {},
  connect,
  disconnect,
};
