import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: [true, 'Please provide a prompt'],
      trim: true,
    },
    imagePath: {
      type: String,
      required: [true, 'Image path is required'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Image = mongoose.model('Image', imageSchema);
export default Image;