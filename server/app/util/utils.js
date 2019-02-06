const {
  promises: { writeFile, readFile, stat, mkdir },
} = require('fs');
const csvWrite = require('csv-stringify');
const csvRead = require('csv-parse');
const b = require('bindings');

const rfOn = b('rfOn');
const rfOff = b('rfOff');
const setPower = b('setPower');
const setAnalyzer = b('setAnalyzer');
const resetAnalyzer = b('resetAnalyzer');
const gp = b('getPower');

const getPower = async () => {
  let data = await gp();

  data = data.split('E');
  const num = +data[0];
  const e = +data[1].split('\n')[0];

  const power = num * 10 ** e;

  const decimalPlacesToRoundTo = 2;
  return Math.round(power * 10 ** decimalPlacesToRoundTo) / 10 ** decimalPlacesToRoundTo;
};

const csvFolderLocation = './server/local';
const csvLocation = (channel, unit, type) => `${csvFolderLocation}/unit${unit}_channel${channel}_${type}.csv`;

const writeCsv = async (channel, data, unit, type) => {
  const csv = await new Promise(resolve => csvWrite(data, (err, d) => resolve(d)));
  // if the local folder doesnt exist, make it
  try {
    await stat(csvFolderLocation);
  } catch (e) {
    await mkdir(csvFolderLocation);
  }
  await writeFile(csvLocation(channel, unit, type), csv);
};

const readCsv = async (channel, unit, type) => {
  // check to see if that channel has a default file
  try {
    await stat(csvLocation(channel, unit, type));
  } catch (e) {
    return [];
  }
  const csv = await readFile(csvLocation(channel, unit, type), 'utf8');
  return new Promise(resolve => csvRead(csv, (err, data) => resolve(data)));
};

const getDateLastModified = (unit, channel, type) =>
  new Promise(async resolve => {
    try {
      const { mtime } = await stat(csvLocation(unit, channel, type));
      mtime.setHours(mtime.getHours() - 8);
      resolve(mtime);
    } catch (e) {
      resolve(null);
    }
  });

module.exports = {
  rfOn,
  rfOff,
  setPower,
  setAnalyzer,
  resetAnalyzer,
  getPower,
  writeCsv,
  readCsv,
  getDateLastModified,
};
