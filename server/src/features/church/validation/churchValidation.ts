import { z } from 'zod';

// Schema for creating a church
export const createChurchSchema = z.object({
  name: z.string().min(2, 'Church name must be at least 2 characters').max(100, 'Church name cannot exceed 100 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address cannot exceed 200 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City cannot exceed 100 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').max(100, 'State cannot exceed 100 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters').max(20, 'Zip code cannot exceed 20 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(100, 'Country cannot exceed 100 characters').default('USA'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  website: z.string().url('Invalid website URL').optional(),
  timezone: z.string().default('America/New_York'),
  serviceDay: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).default('Sunday'),
  serviceTime: z.string().default('10:00 AM'),
  pastorName: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
});

// Schema for updating a church (all fields optional)
export const updateChurchSchema = createChurchSchema.partial();

// Schema for adding a member
export const addMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
});

// Schema for adding an admin
export const addAdminSchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
}); 