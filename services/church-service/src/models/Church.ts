import mongoose, { Schema, Document } from 'mongoose';

// Admin interface - represents a church administrator
export interface IAdmin extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin';
  name: string;
  email: string;
  addedAt: Date;
}

// Address interface - represents a physical address
export interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Social media interface - represents social media accounts
export interface ISocialMedia extends Document {
  platform: string;
  url: string;
  username?: string;
}

// Main Church interface
export interface IChurch extends Document {
  name: string;
  description: string;
  website?: string;
  email: string;
  phone?: string;
  denomination?: string;
  yearFounded?: number;
  size?: number;
  logo?: string;
  bannerImage?: string;
  address: IAddress;
  serviceSchedule: {
    day: string;
    time: string;
    description?: string;
  }[];
  admins: IAdmin[];
  socialMedia?: ISocialMedia[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Schema
const AdminSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['owner', 'admin'],
    default: 'admin'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Address Schema
const AddressSchema: Schema = new Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'USA'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

// Social Media Schema
const SocialMediaSchema: Schema = new Schema({
  platform: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  username: String
});

// Church Schema
const ChurchSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Church name is required'],
      trim: true,
      maxlength: [100, 'Church name cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Church description is required'],
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    website: {
      type: String,
      validate: {
        validator: function(v: string) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
        },
        message: 'Please provide a valid website URL'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      validate: {
        validator: function(v: string) {
          return /^\+?[\d\s-]{10,15}$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    denomination: String,
    yearFounded: {
      type: Number,
      min: [1500, 'Year must be after 1500'],
      max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    size: {
      type: Number,
      min: 0
    },
    logo: String,
    bannerImage: String,
    address: {
      type: AddressSchema,
      required: [true, 'Church address is required']
    },
    serviceSchedule: [
      {
        day: {
          type: String,
          required: true,
          enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        time: {
          type: String,
          required: true
        },
        description: String
      }
    ],
    admins: [AdminSchema],
    socialMedia: [SocialMediaSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
ChurchSchema.index({ name: 1 });
ChurchSchema.index({ 'address.city': 1, 'address.state': 1 });
ChurchSchema.index({ 'admins.userId': 1 });
ChurchSchema.index({ isActive: 1 });

// Virtual for church URL
ChurchSchema.virtual('url').get(function() {
  return `/churches/${this._id}`;
});

// Make sure the first admin is always the owner
ChurchSchema.pre('save', function(next) {
  if (this.isNew && (!this.admins || this.admins.length === 0)) {
    const error = new Error('A church must have at least one admin who is the owner');
    return next(error);
  }
  
  if (this.isNew) {
    // Ensure the first admin is the owner
    this.admins[0].role = 'owner';
  }
  
  next();
});

const Church = mongoose.model<IChurch>('Church', ChurchSchema);

export default Church; 