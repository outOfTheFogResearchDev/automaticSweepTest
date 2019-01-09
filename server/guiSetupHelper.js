const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const {
  promises: { writeFile, readFile, stat, mkdir },
} = require('fs');
const csvWrite = require('csv-stringify');
const csvRead = require('csv-parse');

const config = process.env.NODE_ENV === 'production' ? process.env : require('../config/config');

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

const app = express();

app.disable('x-powered-by');

app.use(
  session({
    secret: config.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // one hour
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(`${__dirname}/../client/dist/`));

const api = express.Router();

api.get('/sweep', async (req, res) => {
  let { startPower, endPower } = req.query;
  startPower = +startPower;
  endPower = +endPower;
  const data = [];
  for (let i = startPower; i <= endPower; i += 0.25) {
    data.push([i, i % 5]);
  }
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

app.use('/api', api);

app.listen(3000, () => console.log('Listening on port: ', 3000)); // eslint-disable-line no-console
