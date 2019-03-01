module.exports = {
  auth: require('./auth'),
  database: require('./database'),
  services: require('./services'),

  // helpers
  log: require('./helpers/log'),
  trycatch: require('./helpers/trycatch'),
};
