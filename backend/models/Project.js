const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // Relationship: Who created this project?
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Relationship: Which users are part of this team?
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);