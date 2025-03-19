import mongoose, { Schema, Document } from 'mongoose';

/**
 * Notification types
 */
export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  INAPP = 'inapp'
}

/**
 * Notification status
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

/**
 * Notification interface
 */
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  isRead: boolean;
  isArchived: boolean;
  metadata: {
    eventId?: mongoose.Types.ObjectId;
    serviceId?: mongoose.Types.ObjectId;
    otherId?: mongoose.Types.ObjectId;
    source?: string;
    category?: string;
    actionLink?: string;
    icon?: string;
    color?: string;
    priority?: 'low' | 'normal' | 'high';
    [key: string]: any;
  };
  delivery: {
    attempts: number;
    lastAttemptAt?: Date;
    failureReason?: string;
    messageId?: string;
    receipts?: Array<{
      status: string;
      timestamp: Date;
      providerId?: string;
      message?: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification schema
 */
const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User'
    },
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church'
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: Object.values(NotificationType)
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Notification content is required']
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING
    },
    sentAt: {
      type: Date
    },
    readAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Object,
      default: {}
    },
    delivery: {
      attempts: {
        type: Number,
        default: 0
      },
      lastAttemptAt: {
        type: Date
      },
      failureReason: {
        type: String
      },
      messageId: {
        type: String
      },
      receipts: [
        {
          status: String,
          timestamp: Date,
          providerId: String,
          message: String
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

/**
 * Define indexes
 */
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });
NotificationSchema.index({ churchId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ 'metadata.eventId': 1, type: 1 });
NotificationSchema.index({ status: 1, type: 1, createdAt: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotification>('Notification', NotificationSchema); 