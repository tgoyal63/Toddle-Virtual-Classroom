const { controllerBoilerPlate, controllerResponse } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const assignmentService = require('../services/assignment.service');
const submissionService = require('../services/submission.service');

module.exports = {
  createAssignment: ('/assignment', controllerBoilerPlate(async (req) => {
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');
    req.body.tutorId = req.id;
    const data = await assignmentService.create(req.body);
    await Promise.all(req.body.students.map(async (studentId) => {
      const submissionData = {
        studentId,
        assignmentId: data._id,
      };
      await submissionService.create(submissionData);
    }));
    return controllerResponse(201, 'Successful', data);
  })),

  updateAssignment: ('/assignment/:assignmentid', controllerBoilerPlate(async (req) => {
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');
    await assignmentService.updateById(req.params.assignmentid, req.body);
    return controllerResponse(204, 'Successful');
  })),

  deleteAssignment: ('/assignment/:assignmentid', controllerBoilerPlate(async (req) => {
    if (req.user !== 'tutor') throw new ControllerError(403, 'Access denied! Only tutors are allowed.');
    await assignmentService.deleteById(req.params.assignmentid);
    return controllerResponse(204, 'Successful');
  })),
};
