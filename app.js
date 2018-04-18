require('dotenv').load();

const _ = require('lodash');
const Promise = require('bluebird');
const express = require('express');
const httpStatus = require('http-status-codes');
const bodyParser = require('body-parser');
const logger = require('thread-logger');
const jwt = require('jsonwebtoken');

const sequelize = require('./database/sequelize');

const app = express();

logger.configure({ logger: false, promise: Promise });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

  if (req.method === 'OPTIONS') {
    return res.send(httpStatus.OK);
  }

  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(logger.MW.addRequestLogging((err, result) => {
  const log = result.log;
  if (_.get(log, 'body.password')) delete log.body.password;
  if (result.req.user) {
    log.user = _.pick(result.req.user, ['id', 'email', 'name', 'username']);
  }

  const error = result.res.errorBody;

  if (error) {
    const formatted = {};
    if (error.stack) formatted.stack = error.stack.split(/\n+|\r+/).map(trace => trace.trim());
    formatted.message = error.message || error;

    log.requestError = formatted;
  }

  console.log(log.statusCode, log.method, log.url);
  console.log(process.env.DOCKIT_ENV === 'local' ? JSON.stringify(log, null, 2) : JSON.stringify(log));
}));

app.use((req, res, next) => {
  console.log(`${(new Date().toLocaleString())} ${req.method.toUpperCase()} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  if (req.query.$or) {
    req.query = { $and: [req.query] };
  }
  else if (req.query.query && req.query.query.$or) {
    req.query.query = { $and: [req.query.query] };
  }
  next();
});

app.use((req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer', '').trim();
    req.token = jwt.decode(token);
  }

  next();
});

const routes = require('./routes');
app.use('/api', routes);

(async () => {
  try {
    await sequelize.sync({ force: false });
    app.listen(process.env.PORT, () => {
      console.info(`Server listening on *:${process.env.PORT}`);
    });
  } catch (err) {
    console.log({ err });
  }
})();
