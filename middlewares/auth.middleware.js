const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;
const commonUtils = require('../utils/common.utils');
const userService = require('../services/user.service');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) throw commonUtils.customError(403, 'Access denied! No token provided.');
    const decodedJWT = await jwt.verify(token, secret);
    if (!decodedJWT) throw commonUtils.customError(401, 'Unauthorized!');
    const data = await userService.searchByEntity('_id', decodedJWT.id);
    if (data && token === data.token) {
      req.user = data.role;
      req.id = data._id;
      next();
    } else {
      throw commonUtils.customError(401, 'Invalid User token!');
    }
  } catch (err) {
    if (err.isCustom === true) {
      throw commonUtils.customError(err.status, err.msg);
    } else {
      throw commonUtils.customError(500, err);
    }
  }
  return 1;
};
