const log = require('./log');

function mapErrors(errorObj) {
  const message = !errorObj.errors
    ? errorObj.message
    : Object.values(errorObj.errors).map(e => e.message);

  return {
    error: true,
    message,
    code: 'VALIDATION01',
  };
}

function wrapTryCatch(fn) {
  return function(req, res, ...args) {
    try {
      let result = fn.call(this, req, res, ...args);
      Promise.resolve(result)
        .then()
        .catch(err => {
          log.error(err);
          res.status(500).json(mapErrors(err));
        });
    } catch (err) {
      log.error(err);
      res.status(500).json(mapErrors(err));
    }
  };
}

function trycatch(controllerObj) {
  const newObj = {};

  Object.keys(controllerObj).forEach(key => {
    const fn = controllerObj[key];
    newObj[key] = wrapTryCatch(fn);
  });

  return newObj;
}

module.exports = trycatch;
