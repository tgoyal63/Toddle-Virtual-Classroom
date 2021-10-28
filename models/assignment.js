// Importing Node Modules
const { model } = require('mongoose');
const { Schema } = require('mongoose');
const { Joi } = require('express-validation');

// Assignment Schema
const assignmentSchema = new Schema({

  assignmentname: {
    type: String,
    required: [true, 'Assignmentname is required'],
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
  },

  students: {
    type: [String],
    required: [true, 'Students List is required'],
  },

  publishedAt: {
    type: Date,
    required: [true, 'Published Date is required'],
  },

  deadlineDate: {
    type: Date,
    required: [true, 'Deadline Date is required'],
  },

  tutorId: {
    type: String,
    required: [true, 'Tutor Id is required'],
  },

}, { timestamps: true });

model('assignment', assignmentSchema);

// Schema for Data Validation
const assignmentValidation = {
  body: Joi.object({
    assignmentname: Joi.string().required(),
    description: Joi.string().required(),
    students: Joi.array().items(Joi.string()).required().unique(),
    publishedAt: Joi.string().required(),
    deadlineDate: Joi.string().required(),
  }),
};
model('assignmentValidation', assignmentValidation);

module.exports = {
  model: model('assignment'),
  schema: assignmentSchema,
  cvModel: model('assignmentValidation'),
  cvSchema: assignmentValidation,
};
