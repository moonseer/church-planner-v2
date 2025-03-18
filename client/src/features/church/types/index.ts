/**
 * Church Types
 */

// Basic user information for church members/admins
export interface ChurchUser {
  _id: string;
  name: string;
  email: string;
}

// Church interface
export interface Church {
  _id: string;
  name: string;
  address: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  phone?: string; // Alias for phoneNumber for compatibility
  email?: string;
  website?: string;
  timezone: string;
  serviceDay: string;
  serviceTime: string;
  pastorName?: string;
  description?: string;
  logo?: string;
  createdBy: string | ChurchUser;
  members: string[] | ChurchUser[];
  admins: string[] | ChurchUser[];
  createdAt: string;
  updatedAt: string;
}

// Church form data for creating/updating
export interface ChurchFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  timezone: string;
  serviceDay: string;
  serviceTime: string;
  pastorName?: string;
  description?: string;
  logo?: string;
}

// API Response types
export interface ChurchResponse {
  church: Church;
}

export interface ChurchesResponse {
  churches: Church[];
}

export interface ChurchListResponse {
  churches: Church[];
  total: number;
  page: number;
  limit: number;
}

// Member management
export interface AddMemberRequest {
  memberId: string;
}

export interface AddAdminRequest {
  adminId: string;
} 