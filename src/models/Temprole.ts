import mongoose from 'mongoose';

const temproleSchema = new mongoose.Schema({
  user: { type: String, required: true },
  role: { type: String, required: true },
  staff: { type: String, required: true },
  createdAt: { type: Date, required: true },
  duration: { type: Number, required: true }
});

export default mongoose.model('Temprole', temproleSchema);
