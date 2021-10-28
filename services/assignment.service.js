// Importing File Dependencies
const { serviceBoilerPlate } = require('../utils/service.utils');
const assignment = require('../models/assignment').model;
const ServiceError = require('../errors/service.error');

module.exports = {

  // Create an assignment in database
  create: serviceBoilerPlate(async (data) => {
    const response = await assignment.create(data);
    return response;
  }),

  // Search for assignments in database
  searchByEntity: serviceBoilerPlate(async (entity, entityValue, filter) => {
    const query = filter;
    if (entity === '_id') {
      query._id = entityValue;
    } else if (entity === 'tutorId') {
      query.tutorId = entityValue;
    } else if (entity === 'publishedAt') {
      query.publishedAt = entityValue;
    } else {
      throw new ServiceError(403, 'Invalid Search');
    }
    const data = await assignment.findOne(query).exec();
    return data;
  }),

  // Searching for Assignments for Multiple Ids in database
  getAssignmentsForStudent: serviceBoilerPlate(async (_ids, filter) => {
    const data = await assignment.find({
      $and: [
        { _id: { $in: _ids } },
        filter,
      ],
    }).exec();
    // , { description: 1, students: 0, assignmentname: 1, publishedAt: 1, deadlineDate: 1 });
    return data;
  }),

  // Update an assignment by its id in database
  updateById: serviceBoilerPlate(async (_id, data) => {
    const response = await assignment.findOneAndUpdate({ _id }, data, { new: true }).exec();
    return response;
  }),

  // Delete an assignment by its id from database
  deleteById: serviceBoilerPlate(async (_id) => {
    const data = await assignment.findOneAndDelete({ _id }).exec();
    return data;
  }),
};
