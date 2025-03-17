import apiClient from './client';
import authApi from './endpoints/auth';
import churchApi from './endpoints/church';
import eventApi from './endpoints/event';

/**
 * API endpoints
 */
const api = {
  auth: authApi,
  church: churchApi,
  event: eventApi,
};

export default api;
export { apiClient, authApi, churchApi, eventApi }; 