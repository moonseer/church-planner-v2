import mongoose from 'mongoose';

export interface ITeam extends mongoose.Document {
  name: string;
  description: string;
  church: mongoose.Types.ObjectId;
  leader: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name for the team'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
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
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<ITeam>('Team', TeamSchema); 