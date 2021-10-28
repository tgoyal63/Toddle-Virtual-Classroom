// Importing File Dependencies
const { controllerBoilerPlate, controllerResponse } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const assignmentService = require('../services/assignment.service');
const submissionService = require('../services/submission.service');
const userService = require('../services/user.service');

module.exports = {

  // Creating an assignment
  createAssignment: ('/assignment', controllerBoilerPlate(async (req) => {
    // Checking if the user has the role 'tutor'
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');

    const { students } = req.body;
    req.body.tutorId = req.id;

    // Checking if the list of students provided are registered
    const unregisteredStudents = [];
    await Promise.all(students.map(async (studentId) => {
      const student = await userService.searchByEntity('_id', studentId);
      if (!student) unregisteredStudents.push(studentId);
    }));
    if (unregisteredStudents.length > 0) throw new ControllerError(404, 'Following Students are not found in the database.', unregisteredStudents);

    // Creating assignment in the database
    const data = await assignmentService.create(req.body);

    // Creating submission slots for the students in the database
    await Promise.all(students.map(async (studentId) => {
      const submissionData = {
        studentId,
        assignmentId: data._id,
        submissionData: null,
        submissionTime: null,
        remarks: null,
      };
      await submissionService.create(submissionData);
    }));
    return controllerResponse(201, 'Successful', data);
  })),

  // Updating an assignment
  updateAssignment: ('/assignment/:assignmentId', controllerBoilerPlate(async (req) => {
    // Checking if the user has the role 'tutor'
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');

    // Updating and checking if the assignment exists
    const data = await assignmentService.updateById(req.params.assignmentId, req.body);
    if (!data) throw new ControllerError(404, 'Assignment not found!');
    return controllerResponse(204, 'Successful');
  })),

  // Deleting an assignment
  deleteAssignment: ('/assignment/:assignmentId', controllerBoilerPlate(async (req) => {
    // Checking if the user has the role 'tutor'
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');

    const { assignmentId } = req.params;

    // Deleting and checking if the assignment exists
    const data = await assignmentService.deleteById(assignmentId);
    if (!data) throw new ControllerError(404, 'Assignment not found!');
    await submissionService.deleteMultiple({ assignmentId });
    return controllerResponse(204, 'Successful');
  })),

  // Adding remarks to student's assignment submission
  checkSubmission: ('/check/:assignmentId', controllerBoilerPlate(async (req) => {
    // Checking if the user has the role 'tutor'
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');

    // Checking if unwanted fields are provided in the body
    const keys = Object.keys(req.body);
    if (Object.hasOwnProperty.call(req.body, '_id', 'submissionData', 'submissionTime', 'createdAt', 'updatedAt') || keys.length > 2) throw new ControllerError(403, 'Only studentId and remarks are allowed.');

    if (!req.body.studentId || !req.body.remarks) throw new ControllerError(400, 'studentId and remarks are required.');
    const { studentId, remarks } = req.body;
    const { assignmentId } = req.params;

    // Updating remarks and checking if the assignment exists
    const data = await submissionService.update({ studentId, assignmentId }, { remarks });
    if (!data) throw new ControllerError(404, 'Assignment not found!');
    return controllerResponse(204, 'Successful');
  })),
};
