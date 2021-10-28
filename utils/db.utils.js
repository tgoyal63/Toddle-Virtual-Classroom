const mongoose = require('mongoose');

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 27017;
const dbName = process.env.DB_NAME || 'vc';
// const dbUser = process.env.DB_USER;
// const dbNPass = process.env.DB_PASSWORD;

const dbConnManager = {
  connect: () => {
    const url = `mongodb://${dbHost}:${dbPort}/${dbName}`;
    return mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  },
  safeConnect: async () => {
    try {
      await dbConnManager.connect();
      console.log(`Connected to database: ${dbName} at ${dbHost}:${dbPort}`);
    } catch (error) {
      console.log('Connection to database failed. Error: ', error);
      console.log('Closing application');
      process.exit();
    }
  },
};

module.exports = dbConnManager;
