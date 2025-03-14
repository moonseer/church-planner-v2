import mongoose from 'mongoose';

export interface IChurch extends mongoose.Document {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  createdAt: Date;
}

const ChurchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a church name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
  },
  state: {
    type: String,
    required: [true, 'Please add a state'],
  },
  zip: {
    type: String,
    required: [true, 'Please add a zip code'],
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  website: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IChurch>('Church', ChurchSchema); 