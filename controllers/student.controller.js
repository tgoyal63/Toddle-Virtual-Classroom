const { controllerBoilerPlate, controllerResponse } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const submissionService = require('../services/submission.service');

module.exports = {
  submission: ('/submit/:assignmentid', controllerBoilerPlate(async (req) => {
    if (req.user !== 'student') throw new ControllerError(403, 'Access denied! Only students are allowed to submit.');
    req.body.studentId = req.id;
    req.body.assignmentId = req.params.assignmentid;
    req.body.submissionTime = new Date();
    const { studentId, assignmentId } = req.body;
    const submission = await submissionService.searchByMultipleParameters({
      studentId,
      assignmentId,
    });
    console.log(submission);
    if (submission[0].submissionData) return controllerResponse(200, 'Only one submission is allowed. Submission Details: ', submission[0]);
    const data = await submissionService.update({ studentId, assignmentId }, req.body);
    return controllerResponse(201, 'Successful', data);
  })),
};
