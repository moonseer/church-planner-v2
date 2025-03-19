import mongoose, { Schema, Document } from 'mongoose';

// Interfaces for nested schemas
export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IChurchRelationship {
  churchId: mongoose.Types.ObjectId;
  role: string;
  ministries: string[];
  groups: string[];
  joinDate: Date;
  status: 'active' | 'inactive' | 'pending';
  isAdmin: boolean;
}

export interface IContactPreference {
  contactMethod: 'email' | 'phone' | 'text' | 'mail';
  isOptedIn: boolean;
}

// Member interface
export interface IMember extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  profilePicture?: string;
  address?: IAddress;
  churches: IChurchRelationship[];
  skills: string[];
  interests: string[];
  contactPreferences: IContactPreference[];
  notes?: string;
  familyMembers?: mongoose.Types.ObjectId[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Address schema
const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'USA' },
});

// Church relationship schema
const ChurchRelationshipSchema = new Schema<IChurchRelationship>({
  churchId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Church ID is required'],
    ref: 'Church',
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['member', 'leader', 'pastor', 'volunteer', 'visitor', 'staff'],
    default: 'member',
  },
  ministries: {
    type: [String],
    default: [],
  },
  groups: {
    type: [String],
    default: [],
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// Contact preference schema
const ContactPreferenceSchema = new Schema<IContactPreference>({
  contactMethod: {
    type: String,
    enum: ['email', 'phone', 'text', 'mail'],
    required: true,
  },
  isOptedIn: {
    type: Boolean,
    default: true,
  },
});

// Member schema
const MemberSchema = new Schema<IMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer not to say', 'other'],
    },
    profilePicture: {
      type: String, // URL to the profile picture
    },
    address: AddressSchema,
    churches: {
      type: [ChurchRelationshipSchema],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    contactPreferences: {
      type: [ContactPreferenceSchema],
      default: [],
    },
    notes: {
      type: String,
    },
    familyMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
MemberSchema.index({ userId: 1 });
MemberSchema.index({ email: 1 });
MemberSchema.index({ 'churches.churchId': 1 });
MemberSchema.index({ firstName: 'text', lastName: 'text' });

// Virtual for full name
MemberSchema.virtual('fullName').get(function (this: IMember) {
  return `${this.firstName} ${this.lastName}`;
});

// Create and export the model
const Member = mongoose.model<IMember>('Member', MemberSchema);
export default Member; 