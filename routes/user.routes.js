const router = require('express').Router();
const { validate, ValidationError } = require('express-validation');
const user = require('../controllers/user.controller');
const tutor = require('../controllers/tutor.controller');
const student = require('../controllers/student.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { cvSchema: userCVSchema } = require('../models/user');
const { cvSchema: assignmentCVSchema } = require('../models/assignment');
const { cvSchema: submissionCVSchema } = require('../models/submission');

// User Routes
router.post('/createuser', validate(userCVSchema), user.createUser);
router.post('/login', user.login);
router.get('/profile', authMiddleware, user.profile);

// Assignment Routes
router.post('/assignment', validate(assignmentCVSchema), authMiddleware, tutor.createAssignment);
router.patch('/assignment/:assignmentId', authMiddleware, tutor.updateAssignment);
router.delete('/assignment/:assignmentId', authMiddleware, tutor.deleteAssignment);
router.get('/assignment/:assignmentId', authMiddleware, user.getSubmission);
router.post('/submit/:assignmentId', validate(submissionCVSchema), authMiddleware, student.submission);
router.post('/assignmentfeed', authMiddleware, user.getAssignments);
router.all('/check/:assignmentId', authMiddleware, tutor.checkSubmission);
/**  filters:
 * publishedAt[SCHEDULED, ONGOING],
 * status(student only): [ALL, PENDING, OVERDUE, SUBMITTED]
 */

// Validation Error Handling
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  const { name, details, statusCode } = err;
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ statusCode, name, message: details.body[0].message });
  }
  return res.status(500).json(err);
});

module.exports = router;
