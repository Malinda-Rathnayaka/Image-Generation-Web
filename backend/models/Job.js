import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    userId: { type: String, required: [true, 'User ID is required'] },
    prompt: { type: String, required: [true, 'Please provide a prompt'], trim: true },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    options: {
      width: { type: Number, default: 512 },
      height: { type: Number, default: 512 },
      transparentBackground: { type: Boolean, default: false }
    },
    imagePath: { type: String },
    simulatedCost: { type: Number, default: 0 },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;