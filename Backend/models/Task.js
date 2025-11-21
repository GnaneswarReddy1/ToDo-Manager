const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  notes: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  tags: [{ type: String }],
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre('save', function(next){
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
