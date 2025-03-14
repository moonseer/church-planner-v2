import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location: string;
  eventType: mongoose.Types.ObjectId;
  church: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the event'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  start: {
    type: Date,
    required: [true, 'Please add a start date and time']
  },
  end: {
    type: Date,
    required: [true, 'Please add an end date and time']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  eventType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventType',
    required: true
  },
  church: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true
  },
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

// Add index for faster querying by date range
EventSchema.index({ start: 1, end: 1 });
EventSchema.index({ church: 1 }); // For filtering by church

export default mongoose.model<IEvent>('Event', EventSchema); 