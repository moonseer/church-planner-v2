import mongoose, { Document, Schema } from 'mongoose';

// Interfaces for nested schemas
export interface IServiceComponent {
  name: string;
  description?: string;
  duration: number; // in minutes
  order: number;
  type: 'worship' | 'prayer' | 'sermon' | 'communion' | 'offering' | 'announcement' | 'other';
  resources?: string[];
  leader?: mongoose.Types.ObjectId;
  notes?: string;
}

export interface IServiceSchedule {
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  name?: string; // e.g., "Morning Service", "Evening Service"
  isActive: boolean;
}

export interface IService extends Document {
  churchId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  location: {
    name: string;
    address?: string;
    virtualLink?: string;
    isVirtual: boolean;
  };
  schedules: IServiceSchedule[];
  components: IServiceComponent[];
  isTemplate: boolean;
  templateName?: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Service component schema
const ServiceComponentSchema = new Schema<IServiceComponent>({
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    min: [0, 'Order must be a non-negative number'],
  },
  type: {
    type: String,
    enum: ['worship', 'prayer', 'sermon', 'communion', 'offering', 'announcement', 'other'],
    required: [true, 'Component type is required'],
  },
  resources: {
    type: [String],
    default: [],
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
  },
  notes: String,
});

// Service schedule schema
const ServiceScheduleSchema = new Schema<IServiceSchedule>({
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: [0, 'Day of week must be between 0 and 6'],
    max: [6, 'Day of week must be between 0 and 6'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
  },
  name: String,
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Service schema
const ServiceSchema = new Schema<IService>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: [true, 'Church ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Service description cannot exceed 1000 characters'],
    },
    location: {
      name: {
        type: String,
        required: [true, 'Location name is required'],
      },
      address: String,
      virtualLink: String,
      isVirtual: {
        type: Boolean,
        default: false,
      },
    },
    schedules: {
      type: [ServiceScheduleSchema],
      default: [],
      validate: {
        validator: function(schedules: IServiceSchedule[]) {
          // At least one schedule is required if not a template
          return this.isTemplate || schedules.length > 0;
        },
        message: 'At least one schedule is required for non-template services',
      },
    },
    components: {
      type: [ServiceComponentSchema],
      default: [],
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
      trim: true,
      sparse: true, // Allow null values but enforce uniqueness when present
    },
    tags: {
      type: [String],
      default: [],
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
ServiceSchema.index({ churchId: 1, name: 1 });
ServiceSchema.index({ 'schedules.dayOfWeek': 1 });
ServiceSchema.index({ isTemplate: 1 });
ServiceSchema.index({ name: 'text', description: 'text' });

// Virtual for total service duration in minutes
ServiceSchema.virtual('totalDuration').get(function(this: IService) {
  return this.components.reduce((total, component) => total + component.duration, 0);
});

// Create and export the model
const Service = mongoose.model<IService>('Service', ServiceSchema);
export default Service; 