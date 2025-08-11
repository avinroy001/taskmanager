const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['TODO', 'DONE'],
    default: 'TODO'
  },
  linkedFile: {
    data: Buffer,
    contentType: String
  },
  createdOn: {
    type: Date,
    default: Date.now,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Task', taskSchema);