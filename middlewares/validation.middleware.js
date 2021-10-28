const { ValidationError, validate } = require('express-validation');

const schemaValidationHandlerMiddleware = (cvSchema) => (req, res, next) => {
  try {
    return validate(cvSchema, {}, {})(req, res, next);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err);
    }
    return res.status(500).json(err);
  }
};

module.exports = { schemaValidationHandlerMiddleware };
