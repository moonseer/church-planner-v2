import mongoose from 'mongoose';

export interface IEventType extends mongoose.Document {
  name: string;
  color: string;
  description: string;
  church: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EventTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name for the event type'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  color: {
    type: String,
    required: [true, 'Please add a color for the event type'],
    default: '#3788d8', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please use a valid hex color']
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IEventType>('EventType', EventTypeSchema); 