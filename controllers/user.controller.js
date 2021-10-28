const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

const { controllerBoilerPlate, controllerResponse } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const userService = require('../services/user.service');
const assignmentService = require('../services/assignment.service');
const submissionService = require('../services/submission.service');

module.exports = {
  createUser: ('/createuser', controllerBoilerPlate(async (req) => {
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
    let data = await userService.create(req.body);
    req.body.token = jwt.sign({ id: data._id }, secret, {
      expiresIn: '9999 years',
    });
    data = await userService.updateById(data._id, { token: req.body.token });
    return controllerResponse(201, 'Successful', { token: data.token });
  })),

  profile: ('/profile', controllerBoilerPlate(async (req) => {
    const data = await userService.searchByEntity('_id', req.id);
    return controllerResponse(200, 'Successful', data);
  })),

  login: ('/login', controllerBoilerPlate(async (req) => {
    const data = await userService.searchByEntity('username', req.body.username);
    if (!data) {
      throw new ControllerError(404, 'User not found!');
    }
    const passwordIsValid = bcryptjs.compareSync(req.body.password, data.password);
    if (!passwordIsValid) {
      throw new ControllerError(401, 'Invalid Password!');
    } else {
      return controllerResponse(200, 'Successful', { token: data.token });
    }
  })),

  getSubmission: ('/assignment/:assignmentid', controllerBoilerPlate(async (req) => {
    if (req.user === 'student') {
      const data = await submissionService.searchByMultipleParameters({
        studentId: req.id,
        assignmentId: req.params.assignmentid,
      });
      return controllerResponse(200, 'Successful', data);
    } if (req.user === 'tutor') {
      const data = await submissionService.searchByEntity('assignmentId', req.params.assignmentid);
      return controllerResponse(200, 'Successful', data);
    }
    throw new ControllerError(403, 'Invalid User!');
  })),

  getAssignments: ('/assignmentfeed', controllerBoilerPlate(async (req) => {
    const date = new Date();
    const filter = {};
    if (req.body.filter && req.body.filter.publishedAt) {
      if (req.body.filter.publishedAt === 'SCHEDULED') filter.publishedAt = { $gt: date };
      else if (req.body.filter.publishedAt === 'ONGOING') filter.publishedAt = { $lt: date };
      else throw new ControllerError(500, 'Invalid filter value for publishedAt.');
    }

    if (req.user === 'tutor') {
      if (req.body.filter && req.body.filter.status) throw new ControllerError(400, 'Only students are allowed for using status filter.');
      const data = await assignmentService.searchByEntity('tutorId', req.id, filter);
      return controllerResponse(200, 'Successful', data);
    } if (req.user === 'student') {
      let submissionFilter = {};
      if (req.body.filter && req.body.filter.status) {
        if (req.body.filter.status === 'ALL') submissionFilter = {};
        else if (req.body.filter.status === 'PENDING') submissionFilter.submissionData = null;
        else if (req.body.filter.status === 'OVERDUE') filter.deadlineDate = { $lt: date };
        else if (req.body.filter.status === 'SUBMITTED') submissionFilter.submissionData = { $ne: null };
        else throw new ControllerError(500, 'Invalid filter value for status.');
      }
      const assignmentIds = await submissionService.getAssignmentIds('studentId', req.id, submissionFilter);
      const Ids = assignmentIds.map((value) => value.assignmentId);
      const assignments = await assignmentService.getAssignmentsForStudent(Ids, filter);
      const a = JSON.parse(JSON.stringify(assignments));
      const result = a.map(({ students, ...rest }) => ({ ...rest }));

      return controllerResponse(200, 'Successful', result);
    }
    throw new ControllerError(403, 'Invalid User!');
  })),
};
