import mongoose, { Document, Schema } from 'mongoose';

export interface IChurch {
  name: string;
  description?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  denomination?: string;
  pastorName?: string;
  serviceTime?: string;
  foundedYear?: number;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IChurchDocument extends IChurch, Document {}

const ChurchSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a church name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    contact: {
      phone: String,
      email: {
        type: String,
        match: [
          /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
          'Please add a valid email',
        ],
      },
      website: String,
    },
    denomination: String,
    pastorName: String,
    serviceTime: String,
    foundedYear: Number,
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create Church model
const Church = mongoose.model<IChurchDocument>('Church', ChurchSchema);

export default Church; 