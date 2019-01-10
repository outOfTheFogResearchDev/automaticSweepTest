const app = require('./app/index');

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log('Listening on port: ', PORT)); // eslint-disable-line no-console
