import mongoose, { Document, Schema } from 'mongoose';

// Interfaces for nested schemas
export interface ILocation {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isVirtual: boolean;
  virtualLink?: string;
  notes?: string;
}

export interface IResource {
  type: 'document' | 'link' | 'image' | 'video' | 'other';
  name: string;
  url: string;
  description?: string;
  isPublic: boolean;
}

export interface IAttendee {
  _id?: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  name?: string; // For non-registered members
  email?: string;
  status: 'registered' | 'attended' | 'absent' | 'cancelled';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
}

export interface IEventTeamMember {
  memberId: mongoose.Types.ObjectId;
  role: string;
  responsibilities?: string[];
  isLeader: boolean;
}

export interface IRecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0-6, where 0 is Sunday
  daysOfMonth?: number[]; // 1-31
  monthsOfYear?: number[]; // 1-12
  endDate?: Date;
  count?: number; // Number of occurrences
}

export interface IEvent extends Document {
  churchId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  eventType: 'service' | 'meeting' | 'class' | 'outreach' | 'social' | 'other';
  category?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  timezone: string;
  location: ILocation;
  recurrence?: IRecurrencePattern;
  parentEventId?: mongoose.Types.ObjectId; // For recurring events, reference to parent event
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility: 'public' | 'church' | 'team' | 'private';
  capacity?: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  resources: IResource[];
  team: IEventTeamMember[];
  attendees: IAttendee[];
  tags: string[];
  color?: string; // For calendar visualization
  isSeriesTemplate: boolean; // Is this event a template for recurring events
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Location schema
const LocationSchema = new Schema<ILocation>({
  name: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isVirtual: { type: Boolean, default: false },
  virtualLink: String,
  notes: String,
});

// Resource schema
const ResourceSchema = new Schema<IResource>({
  type: {
    type: String,
    enum: ['document', 'link', 'image', 'video', 'other'],
    required: true,
  },
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: String,
  isPublic: { type: Boolean, default: true },
});

// Attendee schema
const AttendeeSchema = new Schema<IAttendee>({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
  },
  name: String,
  email: String,
  status: {
    type: String,
    enum: ['registered', 'attended', 'absent', 'cancelled'],
    default: 'registered',
  },
  checkInTime: Date,
  checkOutTime: Date,
  notes: String,
});

// Event team member schema
const EventTeamMemberSchema = new Schema<IEventTeamMember>({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  responsibilities: [String],
  isLeader: {
    type: Boolean,
    default: false,
  },
});

// Recurrence pattern schema
const RecurrencePatternSchema = new Schema<IRecurrencePattern>({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true,
  },
  interval: {
    type: Number,
    default: 1,
    min: 1,
  },
  daysOfWeek: [Number],
  daysOfMonth: [Number],
  monthsOfYear: [Number],
  endDate: Date,
  count: Number,
});

// Event schema
const EventSchema = new Schema<IEvent>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: [true, 'Church ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Event title cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Event description cannot exceed 2000 characters'],
    },
    eventType: {
      type: String,
      enum: ['service', 'meeting', 'class', 'outreach', 'social', 'other'],
      required: [true, 'Event type is required'],
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(this: IEvent, value: Date) {
          return value >= this.startDate;
        },
        message: 'End date must be after or equal to start date',
      },
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    location: {
      type: LocationSchema,
      required: [true, 'Location is required'],
    },
    recurrence: RecurrencePatternSchema,
    parentEventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'church', 'team', 'private'],
      default: 'church',
    },
    capacity: {
      type: Number,
      min: [0, 'Capacity must be a positive number'],
    },
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationDeadline: Date,
    resources: {
      type: [ResourceSchema],
      default: [],
    },
    team: {
      type: [EventTeamMemberSchema],
      default: [],
    },
    attendees: {
      type: [AttendeeSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    color: String,
    isSeriesTemplate: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ churchId: 1, startDate: 1 });
EventSchema.index({ 'attendees.memberId': 1 });
EventSchema.index({ 'team.memberId': 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ title: 'text', description: 'text' });

// Virtual for calculating event duration in minutes
EventSchema.virtual('durationMinutes').get(function(this: IEvent) {
  return Math.round((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60));
});

// Virtual for calculating registration status
EventSchema.virtual('registrationStatus').get(function(this: IEvent) {
  if (!this.registrationRequired) return 'not-required';
  if (!this.registrationDeadline) return 'open';
  
  const now = new Date();
  if (now > this.registrationDeadline) return 'closed';
  if (this.capacity && this.attendees.filter(a => a.status === 'registered' || a.status === 'attended').length >= this.capacity) {
    return 'full';
  }
  return 'open';
});

// Create and export the model
const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event; 