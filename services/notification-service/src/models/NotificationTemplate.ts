import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from './Notification';

/**
 * Template categories
 */
export enum TemplateCategory {
  EVENT = 'event',
  SERVICE = 'service',
  MEMBER = 'member',
  SYSTEM = 'system',
  CUSTOM = 'custom'
}

/**
 * Notification template interface
 */
export interface INotificationTemplate extends Document {
  name: string;
  description?: string;
  type: NotificationType;
  category: TemplateCategory;
  subject: string;
  content: string;
  html?: string;
  variables: string[];
  churchId?: mongoose.Types.ObjectId;
  isDefault: boolean;
  isActive: boolean;
  metadata?: {
    preheader?: string;
    sender?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: {
      filename: string;
      path: string;
      contentType: string;
    }[];
    [key: string]: any;
  };
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification template schema
 */
const NotificationTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: Object.values(NotificationType)
    },
    category: {
      type: String,
      required: [true, 'Template category is required'],
      enum: Object.values(TemplateCategory)
    },
    subject: {
      type: String,
      required: [true, 'Template subject is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Template content is required']
    },
    html: {
      type: String
    },
    variables: {
      type: [String],
      default: []
    },
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    metadata: {
      type: Object,
      default: {}
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

/**
 * Define indexes
 */
NotificationTemplateSchema.index({ name: 1, churchId: 1, type: 1 }, { unique: true });
NotificationTemplateSchema.index({ category: 1, isActive: 1 });
NotificationTemplateSchema.index({ type: 1, isDefault: 1 });

export default mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema); 