// Importing Node Modules
const { model } = require('mongoose');
const { Schema } = require('mongoose');
const { Joi } = require('express-validation');

// Submission Schema
const submissionSchema = new Schema({

  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
  },

  assignmentId: {
    type: String,
    required: [true, 'Assignment ID is required'],
  },

  submissionData: {
    type: String,
  },

  remarks: {
    type: String,
  },

  submissionTime: {
    type: Date,
  },

}, { timestamps: true });

model('submission', submissionSchema);

// Schema for Data Validation
const submissionValidation = {
  body: Joi.object({
    submissionData: Joi.string().required(),
  }),
};
model('submissionValidation', submissionValidation);

module.exports = {
  model: model('submission'),
  schema: submissionSchema,
  cvModel: model('submissionValidation'),
  cvSchema: submissionValidation,
};
