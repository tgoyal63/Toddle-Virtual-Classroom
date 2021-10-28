const { controllerBoilerPlate, controllerResponse } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const assignmentService = require('../services/assignment.service');
const submissionService = require('../services/submission.service');
const userService = require('../services/user.service');

module.exports = {
  createAssignment: ('/assignment', controllerBoilerPlate(async (req) => {
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');
    const { students } = req.body;
    req.body.tutorId = req.id;
    const unregisteredStudents = [];
    await Promise.all(students.map(async (studentId) => {
      const student = await userService.searchByEntity('_id', studentId);
      if (!student) unregisteredStudents.push(studentId);
    }));
    if (unregisteredStudents.length > 0) throw new ControllerError(404, 'Following Students are not found in the database.', unregisteredStudents);
    const data = await assignmentService.create(req.body);
    await Promise.all(students.map(async (studentId) => {
      const submissionData = {
        studentId,
        assignmentId: data._id,
      };
      await submissionService.create(submissionData);
    }));
    return controllerResponse(201, 'Successful', data);
  })),

  updateAssignment: ('/assignment/:assignmentId', controllerBoilerPlate(async (req) => {
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');
    await assignmentService.updateById(req.params.assignmentid, req.body);
    return controllerResponse(204, 'Successful');
  })),

  deleteAssignment: ('/assignment/:assignmentId', controllerBoilerPlate(async (req) => {
    const { assignmentId } = req.params;
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');
    await assignmentService.deleteById(assignmentId);
    await submissionService.deleteMultiple({ assignmentId });
    return controllerResponse(204, 'Successful');
  })),
};
