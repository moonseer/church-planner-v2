/**
 * Shared model types for Church Planner Microservices
 */

import { UserRole } from './auth';

// Base model for all entities
export interface BaseModel {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User model
export interface User extends BaseModel {
  name: string;
  email: string;
  role: UserRole;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

// Church model
export interface Church extends BaseModel {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  owner: string; // Reference to User _id
  admins: string[]; // Reference to User _ids
}

// Church Member model
export interface ChurchMember extends BaseModel {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  joinDate: Date;
  membershipStatus: MembershipStatus;
  baptismDate?: Date;
  gender?: string;
  familyMembers?: FamilyMember[];
  notes?: string;
  church: string; // Reference to Church _id
  isActive: boolean;
  attendanceRecord?: AttendanceRecord[];
  ministries?: string[]; // Reference to Ministry _ids
  profession?: string;
}

// Event model
export interface Event extends BaseModel {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: EventType;
  recurrence?: RecurrencePattern;
  attendees?: string[]; // Reference to ChurchMember _ids
  church: string; // Reference to Church _id
  organizer: string; // Reference to User _id
}

// Enums
export enum MembershipStatus {
  VISITOR = 'visitor',
  REGULAR = 'regular',
  MEMBER = 'member',
  INACTIVE = 'inactive'
}

export enum EventType {
  SERVICE = 'service',
  MEETING = 'meeting',
  OUTREACH = 'outreach',
  SOCIAL = 'social',
  OTHER = 'other'
}

export enum RecurrencePattern {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// Additional types
export interface FamilyMember {
  name: string;
  relationship: string;
  dateOfBirth?: Date;
  isChurchMember?: boolean;
  churchMemberId?: string; // Reference to ChurchMember _id if isChurchMember is true
}

export interface AttendanceRecord {
  date: Date;
  eventId?: string; // Reference to Event _id
  present: boolean;
  notes?: string;
} 