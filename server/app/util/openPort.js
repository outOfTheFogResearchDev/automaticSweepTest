const SerialPort = require('serialport');

module.exports = portName => {
  let callback;
  let handleData;
  let response = '';
  const log = [];

  const port = new SerialPort(portName, {
    baudRate: 115200,
    parity: 'even',
    stopBits: 1,
    dataBits: 8,
    flowControl: 'none',
    parser: new SerialPort.parsers.Readline(),
  });

  const readResponse = () => {
    const indexOfClose = response.indexOf('}');
    if (indexOfClose === -1) return;
    const data = response.slice(1, indexOfClose);
    response = response.slice(indexOfClose + 1);
    log.push(data);
    if (log.length > 25) log.shift();
    if (data === 'Power RESET') return;
    if (data.length > 5) {
      callback(data);
      return;
    }
    handleData();
  };

  handleData = () => {
    if (response[0] === '{') readResponse();
    if (response) {
      response = response.slice(1);
      handleData();
    }
  };

  port.on('readable', () => {
    response += port.read().toString('utf8');
    handleData();
  });

  port.writeCommand = (command, parser = data => data) =>
    command.length === 5
      ? new Promise(resolve => {
          callback = data => resolve(parser(data, command));
          port.write(`{${command}}`);
        })
      : null;

  port.log = () => log;

  return port;
};
