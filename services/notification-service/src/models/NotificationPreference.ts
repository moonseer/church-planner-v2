import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from './Notification';

/**
 * Notification preference categories
 */
export enum PreferenceCategory {
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_REMINDER = 'event_reminder',
  EVENT_CANCELLED = 'event_cancelled',
  EVENT_TEAM_ADDED = 'event_team_added',
  EVENT_TEAM_REMOVED = 'event_team_removed',
  SERVICE_CREATED = 'service_created',
  SERVICE_UPDATED = 'service_updated',
  SERVICE_CANCELLED = 'service_cancelled',
  SERVICE_TEAM_ADDED = 'service_team_added',
  SERVICE_TEAM_REMOVED = 'service_team_removed',
  MEMBER_WELCOME = 'member_welcome',
  MEMBER_BIRTHDAY = 'member_birthday',
  MEMBER_ANNIVERSARY = 'member_anniversary',
  CHURCH_ANNOUNCEMENT = 'church_announcement',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ACCOUNT_ACTIVITY = 'account_activity'
}

/**
 * Notification preference interface
 */
export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  preferences: {
    [key in PreferenceCategory]?: {
      enabled: boolean;
      channels: NotificationType[];
      customDeliveryTime?: string;
      reminderInterval?: number; // Reminder interval in minutes
    };
  };
  globalPreferences: {
    doNotDisturb: {
      enabled: boolean;
      startTime?: string; // Format: HH:MM in 24-hour
      endTime?: string; // Format: HH:MM in 24-hour
      timezone?: string;
    };
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    digest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number; // 0-6, Sunday-Saturday
      timeOfDay?: string; // Format: HH:MM in 24-hour
    };
  };
  deviceTokens?: {
    [key: string]: {
      token: string;
      device: string;
      platform: 'ios' | 'android' | 'web';
      createdAt: Date;
      lastUsedAt: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification preference schema
 */
const NotificationPreferenceSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
      unique: true
    },
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church'
    },
    preferences: {
      type: Object,
      default: () => {
        // Create default preferences for all categories
        const defaults = {};
        Object.values(PreferenceCategory).forEach(category => {
          defaults[category] = {
            enabled: true,
            channels: [NotificationType.EMAIL, NotificationType.INAPP]
          };
          
          // Add additional defaults for specific categories
          if (category === PreferenceCategory.EVENT_REMINDER) {
            defaults[category].reminderInterval = 60; // 1 hour
          }
        });
        return defaults;
      }
    },
    globalPreferences: {
      doNotDisturb: {
        enabled: {
          type: Boolean,
          default: false
        },
        startTime: String,
        endTime: String,
        timezone: String
      },
      emailEnabled: {
        type: Boolean,
        default: true
      },
      smsEnabled: {
        type: Boolean,
        default: true
      },
      pushEnabled: {
        type: Boolean,
        default: true
      },
      inAppEnabled: {
        type: Boolean,
        default: true
      },
      digest: {
        enabled: {
          type: Boolean,
          default: false
        },
        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'monthly'],
          default: 'daily'
        },
        dayOfWeek: Number,
        timeOfDay: String
      }
    },
    deviceTokens: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

/**
 * Define indexes
 */
NotificationPreferenceSchema.index({ userId: 1 }, { unique: true });
NotificationPreferenceSchema.index({ churchId: 1 });

export default mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema); 