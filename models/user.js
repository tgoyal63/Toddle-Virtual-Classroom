// Importing Node Modules
const { model } = require('mongoose');
const { Schema } = require('mongoose');
const { Joi } = require('express-validation');

// User Schema
const userSchema = new Schema({

  username: {
    type: String,
    unique: true,
    required: [true, 'Username is required'],
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  token: {
    type: String,
  },

  role: {
    type: String,
    enum: ['student', 'tutor'],
    required: [true, 'Role is required'],
  },

}, { timestamps: true });

model('user', userSchema);

// Schema for Data Validation
const userValidation = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
  }),
};
model('userValidation', userValidation);

module.exports = {
  model: model('user'),
  schema: userSchema,
  cvModel: model('userValidation'),
  cvSchema: userValidation,
};
