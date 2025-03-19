import { apiClient } from '../client';
import { ApiResponse, PaginatedResponse, QueryParams } from '@shared/types/api';
import { ChurchMember } from '@shared/types/models';

/**
 * Member API service for interacting with the Member Service via the API Gateway
 */
export const memberAPI = {
  /**
   * Get all members for a church (paginated)
   */
  async getMembers(churchId: string, query?: QueryParams): Promise<PaginatedResponse<ChurchMember>> {
    return apiClient.get<PaginatedResponse<ChurchMember>>(`/churches/${churchId}/members`, query);
  },

  /**
   * Get a member by ID
   */
  async getMember(churchId: string, memberId: string): Promise<ApiResponse<ChurchMember>> {
    return apiClient.get<ApiResponse<ChurchMember>>(`/churches/${churchId}/members/${memberId}`);
  },

  /**
   * Create a new member
   */
  async createMember(churchId: string, memberData: Partial<ChurchMember>): Promise<ApiResponse<ChurchMember>> {
    return apiClient.post<ApiResponse<ChurchMember>>(`/churches/${churchId}/members`, memberData);
  },

  /**
   * Update a member
   */
  async updateMember(churchId: string, memberId: string, memberData: Partial<ChurchMember>): Promise<ApiResponse<ChurchMember>> {
    return apiClient.put<ApiResponse<ChurchMember>>(`/churches/${churchId}/members/${memberId}`, memberData);
  },

  /**
   * Delete a member
   */
  async deleteMember(churchId: string, memberId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/churches/${churchId}/members/${memberId}`);
  },

  /**
   * Search members by name, email, or phone
   */
  async searchMembers(churchId: string, searchTerm: string): Promise<PaginatedResponse<ChurchMember>> {
    return apiClient.get<PaginatedResponse<ChurchMember>>(`/churches/${churchId}/members/search`, { searchTerm });
  },

  /**
   * Get member statistics for a church
   */
  async getMemberStats(churchId: string): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    visitors: number;
    regulars: number;
    members: number;
    recentJoins: number;
    genderDistribution: {
      male: number;
      female: number;
      other: number;
      unspecified: number;
    };
  }>> {
    return apiClient.get<ApiResponse<any>>(`/churches/${churchId}/members/stats`);
  },

  /**
   * Update member attendance
   */
  async updateAttendance(
    churchId: string, 
    memberId: string, 
    attendanceData: { date: Date; eventId?: string; present: boolean; notes?: string }
  ): Promise<ApiResponse<ChurchMember>> {
    return apiClient.post<ApiResponse<ChurchMember>>(
      `/churches/${churchId}/members/${memberId}/attendance`,
      attendanceData
    );
  }
}; 