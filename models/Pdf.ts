import mongoose, { Schema } from 'mongoose';

// PDF document metadata schema
const PdfSchema = new Schema({
  filename: {
    type: String, 
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: String, // Admin email
    required: true
  }
});

// Check if the model has been compiled already
export default mongoose.models.Pdf || mongoose.model('Pdf', PdfSchema);
