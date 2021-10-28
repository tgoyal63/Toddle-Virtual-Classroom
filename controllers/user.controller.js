// Importing Node Modules
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

// Importing File Dependencies
const { controllerBoilerPlate, controllerResponse } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const userService = require('../services/user.service');
const assignmentService = require('../services/assignment.service');
const submissionService = require('../services/submission.service');

module.exports = {

  // Creating User (Student and Tutor)
  createUser: ('/createuser', controllerBoilerPlate(async (req) => {
    // Hashing the password for securely storing in the database
    req.body.password = bcryptjs.hashSync(req.body.password, 10);

    // Creating the User
    let data = await userService.create(req.body);

    // Creating a JWT Token for the user
    req.body.token = jwt.sign({ id: data._id }, secret, {
      expiresIn: '9999 years',
    });

    // Updating the token in the database
    data = await userService.updateById(data._id, { token: req.body.token });
    return controllerResponse(201, 'Successful', { token: data.token });
  })),

  // Viewing User Profile (Student and Tutor)
  profile: ('/profile', controllerBoilerPlate(async (req) => {
    const data = await userService.searchByEntity('_id', req.id);
    return controllerResponse(200, 'Successful', data);
  })),

  // Logging in User (Student and Tutor)
  login: ('/login', controllerBoilerPlate(async (req) => {
    // Checking if the user exists in the database
    const data = await userService.searchByEntity('username', req.body.username);
    if (!data) {
      throw new ControllerError(404, 'User not found!');
    }

    // Checking if the password is valid or not
    const passwordIsValid = bcryptjs.compareSync(req.body.password, data.password);
    if (!passwordIsValid) {
      throw new ControllerError(401, 'Invalid Password!');
    } else {
      return controllerResponse(200, 'Successful', { token: data.token });
    }
  })),

  // Get Assignment Submissions (Student and Tutor)
  getSubmission: ('/assignment/:assignmentId', controllerBoilerPlate(async (req) => {
    const { assignmentId } = req.params;

    // For users with the role 'student'
    if (req.user === 'student') {
      const data = await submissionService.searchByMultipleParameters({
        studentId: req.id,
        assignmentId,
      });
      return controllerResponse(200, 'Successful', data);
    }

    // For users with the role 'tutor'
    if (req.user === 'tutor') {
      const data = await submissionService.searchByEntity('assignmentId', assignmentId);
      return controllerResponse(200, 'Successful', data);
    }
    throw new ControllerError(403, 'Invalid User!');
  })),

  // Get Assignment Feed (Student and Tutor)
  getAssignments: ('/assignmentfeed', controllerBoilerPlate(async (req) => {
    const date = new Date();
    const filter = {};
    if (req.body.filter && req.body.filter.publishedAt) {
      if (req.body.filter.publishedAt === 'SCHEDULED') filter.publishedAt = { $gt: date };
      else if (req.body.filter.publishedAt === 'ONGOING') filter.publishedAt = { $lt: date };
      else throw new ControllerError(500, 'Invalid filter value for publishedAt.');
    }

    // For users with the role 'tutor'
    if (req.user === 'tutor') {
      // Checking for different filters and modifying the query according to it
      if (req.body.filter && req.body.filter.status) throw new ControllerError(400, 'Only students are allowed for using status filter.');
      const data = await assignmentService.searchByEntity('tutorId', req.id, filter);
      return controllerResponse(200, 'Successful', data);
    }

    // For users with the role 'student'
    if (req.user === 'student') {
      let submissionFilter = {};

      // Checking for different filters and modifying the query according to it
      if (req.body.filter && req.body.filter.status) {
        if (req.body.filter.status === 'ALL') submissionFilter = {};
        else if (req.body.filter.status === 'PENDING') submissionFilter.submissionData = null;
        else if (req.body.filter.status === 'OVERDUE') filter.deadlineDate = { $lt: date };
        else if (req.body.filter.status === 'SUBMITTED') submissionFilter.submissionData = { $ne: null };
        else throw new ControllerError(500, 'Invalid filter value for status.');
      }

      // Getting the assignmentIds for the student
      const assignmentIds = await submissionService.getAssignmentIds('studentId', req.id, submissionFilter);
      const Ids = assignmentIds.map((value) => value.assignmentId);

      // Getting the assignment details for the assignmentIds
      const assignments = await assignmentService.getAssignmentsForStudent(Ids, filter);

      const a = JSON.parse(JSON.stringify(assignments));
      const result = a.map(({ students, ...rest }) => ({ ...rest }));

      return controllerResponse(200, 'Successful', result);
    }
    throw new ControllerError(403, 'Invalid User!');
  })),
};
