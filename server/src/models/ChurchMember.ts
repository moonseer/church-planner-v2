import mongoose, { Document, Schema } from 'mongoose';

export interface IChurchMember {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  joinDate?: Date;
  membershipStatus?: string;
  baptismDate?: Date;
  gender?: string;
  familyMembers?: mongoose.Types.ObjectId[];
  notes?: string;
  church: mongoose.Types.ObjectId;
  isActive: boolean;
  attendanceRecord?: {
    date: Date;
    attended: boolean;
  }[];
  age?: number;
  ministry?: string[];
  profession?: string;
}

export interface IChurchMemberDocument extends IChurchMember, Document {}

const ChurchMemberSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    dateOfBirth: {
      type: Date,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    membershipStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Visitor', 'Regular Attendee', 'Member'],
      default: 'Visitor',
    },
    baptismDate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    familyMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChurchMember',
      },
    ],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
    church: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Church',
      required: [true, 'Please add a church'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attendanceRecord: [
      {
        date: {
          type: Date,
          required: true,
        },
        attended: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ministry: [String],
    profession: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
ChurchMemberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
ChurchMemberSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Index for faster queries
ChurchMemberSchema.index({ firstName: 1, lastName: 1, church: 1 });
ChurchMemberSchema.index({ email: 1, church: 1 });

const ChurchMember = mongoose.model<IChurchMemberDocument>('ChurchMember', ChurchMemberSchema);

export default ChurchMember; 