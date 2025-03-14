import mongoose from 'mongoose';

export interface IService extends mongoose.Document {
  title: string;
  date: Date;
  description: string;
  church: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  items: {
    order: number;
    title: string;
    type: string;
    duration: number;
    notes: string;
    assignedTo: mongoose.Types.ObjectId;
  }[];
}

const ServiceItemSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the service item'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please add a type for the service item'],
    enum: ['song', 'reading', 'prayer', 'sermon', 'offering', 'communion', 'announcement', 'other'],
    default: 'other'
  },
  duration: {
    type: Number, // Duration in minutes
    default: 5
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the service'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date for the service']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  church: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  items: [ServiceItemSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster querying by date
ServiceSchema.index({ date: 1 });
ServiceSchema.index({ church: 1 }); // For filtering by church

export default mongoose.model<IService>('Service', ServiceSchema); 