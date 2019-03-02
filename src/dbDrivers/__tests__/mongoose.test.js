require('dotenv').config();
const dbDrivers = require('./../index');

describe('Database', () => {
  it('Should connect with mongoDB', () => {
    const con = dbDrivers.mongoDB({
      connectionString: process.env.DB_CONNECTION_STRING,
    });

    return con;
  });
});
