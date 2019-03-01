const mongoose = require('mongoose');
const log = require('@helpers/log');

function mongoProvider({
  connectionString,
  onError = () => {},
  onSucess = () => {},
}) {
  return new Promise((resolve, reject) => {
    try {
      // start connection
      log.info('[mongoDB] Initiaining connection...');
      mongoose.connect(connectionString);
      const db = mongoose.connection;

      // turn on debug
      if (process.env.DEV) mongoose.set('debug', true);

      // connection error
      db.on('error', function(err) {
        log.error(`[mongoDB] Connection failed for: ${connectionString} `);
        log.error(err);
        onError();
        reject(err);
      });

      // success
      db.once('open', function() {
        log.success('[mongoDB] Connected to database!');
        onSuccess();
        resolve(true);
      });
    } catch (err) {
      log.error('[mongoDB]: ' + err);
      onError();
      reject(err);
    }
  });
}

module.exports = mongoProvider;
