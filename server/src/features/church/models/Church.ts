import mongoose, { Document, Schema } from 'mongoose';

export interface IChurch extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  timezone: string;
  serviceDay: string;
  serviceTime: string;
  pastorName?: string;
  description?: string;
  logo?: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChurchSchema = new Schema<IChurch>(
  {
    name: {
      type: String,
      required: [true, 'Church name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'Zip Code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'USA',
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    website: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      default: 'America/New_York',
      required: [true, 'Timezone is required'],
    },
    serviceDay: {
      type: String,
      required: [true, 'Service day is required'],
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      default: 'Sunday',
    },
    serviceTime: {
      type: String,
      required: [true, 'Service time is required'],
      default: '10:00 AM',
    },
    pastorName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Create and export the Church model
const Church = mongoose.model<IChurch>('Church', ChurchSchema);

export default Church; 