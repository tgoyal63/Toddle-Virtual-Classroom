// Importing File Dependencies
const { serviceBoilerPlate } = require('../utils/service.utils');
const submission = require('../models/submission').model;
const ServiceError = require('../errors/service.error');

module.exports = {

  // Create an submission in database
  create: serviceBoilerPlate(async (data) => {
    const response = await submission.create(data);
    return response;
  }),

  // Search for submissions in database
  searchByEntity: serviceBoilerPlate(async (entity, entityValue) => {
    let data;
    if (entity === '_id') {
      data = await submission.findOne({ _id: entityValue }).exec();
    } else if (entity === 'studentId') {
      data = await submission.find({ studentId: entityValue }).exec();
    } else if (entity === 'assignmentId') {
      data = await submission.find({ assignmentId: entityValue }).exec();
    } else {
      throw new ServiceError(403, 'Invalid Search');
    }
    return data;
  }),

  getAssignmentIds: serviceBoilerPlate(async (entity, entityValue, filter) => {
    const query = {};
    if (entity === '_id') {
      query._id = entityValue;
    } else if (entity === 'studentId') {
      query.studentId = entityValue;
    } else {
      throw new ServiceError(403, 'Invalid Search');
    }
    const data = await submission.find({
      $and: [
        query, filter,
      ],
    }, { assignmentId: 1, _id: 0 }).exec();
    return data;
  }),

  searchByMultipleParameters: serviceBoilerPlate(async (data) => {
    const response = await submission.find(data).exec();
    return response;
  }),

  // Update an submission by its id in database
  updateById: serviceBoilerPlate(async (_id, data) => {
    const response = await submission.findOneAndUpdate({ _id }, data, { new: true }).exec();
    return response;
  }),

  // Update an submission by custom query in database
  update: serviceBoilerPlate(async (query, data) => {
    const response = await submission.findOneAndUpdate(query, data, { new: true }).exec();
    return response;
  }),

  // Delete an submission by its id from database
  deleteById: serviceBoilerPlate(async (_id) => {
    await submission.findOneAndDelete({ _id }).exec();
  }),

  // Delete multiple submissions by custom query from database
  deleteMultiple: serviceBoilerPlate(async (query) => {
    await submission.deleteMany(query).exec();
  }),
};
