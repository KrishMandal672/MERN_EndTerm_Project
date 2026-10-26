import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 80 },
  course: { type: String, required: true, trim: true, maxlength: 40 },
  due: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  effort: { type: Number, required: true, enum: [1, 2, 3] },
  importance: { type: Number, required: true, enum: [1, 2, 3] },
  done: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

taskSchema.index({ owner: 1, done: 1, due: 1 });
export default mongoose.model('Task', taskSchema);

