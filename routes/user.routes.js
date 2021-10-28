const router = require('express').Router();
const user = require('../controllers/user.controller');
const tutor = require('../controllers/tutor.controller');
const student = require('../controllers/student.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { schemaValidationHandlerMiddleware } = require('../middlewares/validation.middleware');
const { cvSchema: userCVSchema } = require('../models/user');
const { cvSchema: assignmentCVSchema } = require('../models/assignment');
const { cvSchema: submissionCVSchema } = require('../models/submission');

router.post('/createuser', schemaValidationHandlerMiddleware(userCVSchema), user.createUser);
router.post('/login', user.login);
router.get('/profile', authMiddleware, user.profile);
router.post('/assignment', schemaValidationHandlerMiddleware(assignmentCVSchema), authMiddleware, tutor.createAssignment);
router.patch('/assignment/:assignmentid', authMiddleware, tutor.updateAssignment);
router.delete('/assignment/:assignmentid', authMiddleware, tutor.deleteAssignment);
router.get('/assignment/:assignmentid', authMiddleware, user.getSubmission);
router.post('/submit/:assignmentid', schemaValidationHandlerMiddleware(submissionCVSchema), authMiddleware, student.submission);
router.post('/assignmentfeed', authMiddleware, user.getAssignments);
// filters: publishedAt[SCHEDULED, ONGOING],
// status(student only): [ALL, PENDING, OVERDUE, SUBMITTED]

module.exports = router;
