import { Document, Model, Types } from 'mongoose';
import { UserRole } from './auth';

/**
 * Base interface for all document types
 */
export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Basic identification information for any document
 */
export interface Identifiable {
  _id: Types.ObjectId;
}

/**
 * Timestamp information for documents
 */
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Named entity interface
 */
export interface Named {
  name: string;
}

/**
 * Contact information interface
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
}

/**
 * Web presence interface
 */
export interface WebPresence {
  website?: string;
}

/**
 * Address information interface
 */
export interface AddressInfo {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

/**
 * Church ownership interface - for entities belonging to a church
 */
export interface ChurchOwned {
  church: Types.ObjectId | IChurchDocument;
}

/**
 * Descriptive entity interface
 */
export interface Descriptive {
  description?: string;
}

/**
 * User authentication details
 */
export interface UserAuth {
  email: string;
  password: string;
  role: UserRole;
}

/**
 * User security details for account locking
 */
export interface UserSecurity {
  passwordLastChanged: Date;
  loginAttempts: number;
  lockUntil?: Date;
}

/**
 * User document interface - represents a MongoDB user document
 */
export interface IUserDocument extends BaseDocument, Named, UserAuth, UserSecurity {
  church?: Types.ObjectId | IChurchDocument;
}

/**
 * User model interface - for model static methods
 */
export interface IUserModel extends Model<IUserDocument> {
  // Add any static methods here
}

/**
 * Church document interface - represents a MongoDB church document
 */
export interface IChurchDocument extends BaseDocument, Named, AddressInfo, ContactInfo, WebPresence {
  // No additional properties needed as all are covered by the extended interfaces
}

/**
 * Church model interface - for model static methods
 */
export interface IChurchModel extends Model<IChurchDocument> {
  // Add any static methods here
}

/**
 * Event scheduling interface
 */
export interface Schedulable {
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
}

/**
 * Event document interface - represents a MongoDB event document
 */
export interface IEventDocument extends BaseDocument, Schedulable, ChurchOwned, Descriptive {
  title: string;
  eventType?: Types.ObjectId | IEventTypeDocument;
}

/**
 * Event type document interface - represents a MongoDB event type document
 */
export interface IEventTypeDocument extends BaseDocument, Named, Descriptive, ChurchOwned {
  color: string;
}

/**
 * Team document interface - represents a MongoDB team document
 */
export interface ITeamDocument extends BaseDocument, Named, Descriptive, ChurchOwned {
  leader: Types.ObjectId | IUserDocument;
}

/**
 * Team membership information
 */
export interface TeamMembership {
  team: Types.ObjectId | ITeamDocument;
  user: Types.ObjectId | IUserDocument;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
}

/**
 * Team member document interface - represents a MongoDB team member document
 */
export interface ITeamMemberDocument extends BaseDocument, TeamMembership {
  // All properties are inherited from TeamMembership and BaseDocument
}

/**
 * Service document interface - represents a MongoDB service document
 */
export interface IServiceDocument extends BaseDocument, ChurchOwned, Descriptive {
  title: string;
  date: Date;
  event?: Types.ObjectId | IEventDocument;
  items: Array<Types.ObjectId | IServiceItemDocument>;
}

/**
 * Service item information
 */
export interface ServiceItemInfo {
  order: number;
  title: string;
  type: string;
  duration: number;
  notes?: string;
}

/**
 * Team assignment interface
 */
export interface TeamAssignment {
  assignedTeamMembers?: Array<Types.ObjectId | ITeamMemberDocument>;
}

/**
 * Service item document interface - represents a MongoDB service item document
 */
export interface IServiceItemDocument extends BaseDocument, ServiceItemInfo, TeamAssignment {
  // All properties are inherited from the extended interfaces
} 