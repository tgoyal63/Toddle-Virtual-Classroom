// Importing File Dependencies
const { serviceBoilerPlate } = require('../utils/service.utils');
const user = require('../models/user').model;
const ServiceError = require('../errors/service.error');

module.exports = {

  // Creating a user in database
  create: serviceBoilerPlate(async (data) => {
    const response = await user.create(data);
    return response;
  }),

  searchByEntity: serviceBoilerPlate(async (entity, entityValue) => {
    let data;
    if (entity === '_id') {
      data = await user.findOne({ _id: entityValue }).exec();
    } else if (entity === 'username') {
      data = await user.findOne({ username: entityValue }).exec();
    } else {
      throw new ServiceError(403, 'Invalid Search');
    }
    return data;
  }),

  updateById: serviceBoilerPlate(async (_id, body) => {
    const data = await user.findOneAndUpdate({ _id }, body, { new: true }).exec();
    return data;
  }),

  deleteById: serviceBoilerPlate(async (_id) => {
    await user.findOneAndDelete({ _id }).exec();
  }),
};
