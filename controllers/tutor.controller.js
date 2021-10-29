// Importing File Dependencies
const { controllerBoilerPlate, controllerResponse } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const assignmentService = require('../services/assignment.service');
const submissionService = require('../services/submission.service');
const userService = require('../services/user.service');
const { pushMail } = require('../utils/mail.utils');

module.exports = {

  // Creating an assignment
  createAssignment: ('/assignment', controllerBoilerPlate(async (req) => {
    // Checking if the user has the role 'tutor'
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');
    const { students } = req.body;
    req.body.tutorId = req.id;

    // Checking if the list of students provided are registered
    const unregisteredStudents = [];
    const studentEmails = [];
    await Promise.all(students.map(async (studentId) => {
      const student = await userService.searchByEntity('_id', studentId);
      studentEmails.push(student.email);
      if (!student) unregisteredStudents.push(studentId);
    }));
    if (unregisteredStudents.length > 0) throw new ControllerError(404, 'Following Students are not found in the database.', unregisteredStudents);

    // Creating assignment in the database
    const data = await assignmentService.create(req.body);

    // Creating submission slots for the students in the database
    await Promise.all(students.map(async (studentId) => {
      const to = studentEmails.join(', ');
      const subject = `New Assignment - ${req.body.assignmentname}`;
      const text = `New Assignment - ${req.body.assignmentname} is scheduled on ${req.body.publishedAt}.`;
      const html = `<b>New Assignment</b> - <i>${req.body.assignmentname}</i> is scheduled on <i>${req.body.publishedAt}</i>.`;
      await pushMail({
        to, subject, text, html,
      });
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

    // Checking if the user sent data in body
    if (!req.body) throw new ControllerError(404, 'Please include the data in the request body, that needs to be updated.');

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

    // Checking if required fields provided in the body or not
    if (!req.body.studentId) throw new ControllerError(400, 'studentId is required.');
    if (!req.body.remarks) throw new ControllerError(400, 'remarks is required.');

    const { studentId, remarks } = req.body;
    const { assignmentId } = req.params;

    // Updating remarks and checking if the assignment exists
    const data = await submissionService.update({ studentId, assignmentId }, { remarks });
    if (!data) throw new ControllerError(404, 'Assignment not found!');
    return controllerResponse(204, 'Successful');
  })),
};
