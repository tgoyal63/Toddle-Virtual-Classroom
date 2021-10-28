const ServiceError = require('../errors/service.error');

// BoilerPlate Code for Services
const serviceBoilerPlate = (wrapped) => (...params) => wrapped(...params).catch((err) => {
  if (err.code === 11000) {
    throw new ServiceError(409, 'Following fields are duplicate. Please provide a unique value for each field.', err.keyValue);
  } else if (err.name === 'CastError') {
    throw new ServiceError(403, `Invalid Creation ${err}`);
  } else throw err;
});

module.exports = {
  serviceBoilerPlate,
};
