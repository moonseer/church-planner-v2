import mongoose from 'mongoose';
import { IChurchDocument, IChurchModel } from '@shared/types/mongoose';

const ChurchSchema = new mongoose.Schema<IChurchDocument, IChurchModel>({
  name: {
    type: String,
    required: [true, 'Please add a church name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  address: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  zip: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  website: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

const Church = mongoose.model<IChurchDocument, IChurchModel>('Church', ChurchSchema);

export default Church; 