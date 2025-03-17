/**
 * Shared types for data models across client and server
 */

// Base model types
/**
 * Core identifier interface
 */
export interface IIdentifier {
  id: string;
}

/**
 * Timestamp tracking interface
 */
export interface ITimestamps {
  createdAt: string;
  updatedAt: string;
}

/**
 * Basic entity with name interface
 */
export interface INamedEntity extends IIdentifier, ITimestamps {
  name: string;
}

/**
 * Interface for entities with description
 */
export interface IDescribable {
  description?: string;
}

/**
 * Contact information interface
 */
export interface IContactable {
  email?: string;
  phone?: string;
}

/**
 * Web presence interface
 */
export interface IWebPresence {
  website?: string;
}

/**
 * Full address interface
 */
export interface IAddressable {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

/**
 * Church owned entity interface
 */
export interface IChurchOwned {
  church: string;
}

// Church model
export interface IChurch extends INamedEntity, IAddressable, IContactable, IWebPresence {
  // All properties are inherited from the extended interfaces
}

// Event Type model
export interface IEventType extends INamedEntity, IDescribable, IChurchOwned {
  color: string;
}

/**
 * Schedulable entity interface
 */
export interface ISchedulable {
  start: string; // ISO date string
  end: string; // ISO date string
  allDay: boolean;
  location?: string;
}

// Event model
export interface IEvent extends IIdentifier, ITimestamps, IDescribable, ISchedulable, IChurchOwned {
  title: string;
  eventType: string | IEventType;
}

// Team model
export interface ITeam extends INamedEntity, IDescribable, IChurchOwned {
  leader: string; // User ID
}

/**
 * Team member status enum
 */
export enum TeamMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Team membership information
 */
export interface ITeamMembership {
  team: string | ITeam;
  user: string; // User ID
  role?: string;
  status: TeamMemberStatus;
  joinedAt: string;
}

// Team member model
export interface ITeamMember extends IIdentifier, ITimestamps, ITeamMembership {
  // All properties are inherited from the extended interfaces
}

/**
 * Service item details
 */
export interface IServiceItemDetails {
  order: number;
  title: string;
  type: string;
  duration: number; // Duration in minutes
  notes?: string;
}

/**
 * Team assignment interface
 */
export interface ITeamAssignable {
  assignedTeamMembers?: string[]; // Team member IDs
}

// Service item model
export interface IServiceItem extends IIdentifier, IServiceItemDetails, ITeamAssignable {
  // All properties are inherited from the extended interfaces
}

// Service model
export interface IService extends IIdentifier, ITimestamps, IDescribable, IChurchOwned {
  title: string;
  date: string; // ISO date string
  event?: string | IEvent;
  items: IServiceItem[];
} 