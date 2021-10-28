const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;
const { controllerBoilerPlate } = require('../utils/controller.utils');
const ControllerError = require('../errors/controller.error');
const userService = require('../services/user.service');

module.exports = controllerBoilerPlate(async (req, res, next) => {
  if (!(req.headers && req.headers.authorization)) throw new ControllerError(403, 'Access denied! No token provided.');
  console.log('OASS');
  const token = req.headers.authorization.split(' ')[1];
  if (!token) throw new ControllerError(403, 'Access denied! No token provided.');
  const decodedJWT = await jwt.verify(token, secret);
  if (!decodedJWT) throw new ControllerError(401, 'Unauthorized!');
  const data = await userService.searchByEntity('_id', decodedJWT.id);
  if (data && token === data.token) {
    req.user = data.role;
    req.id = data._id;
    next();
  } else {
    throw new ControllerError(401, 'Invalid User token!');
  }
});
