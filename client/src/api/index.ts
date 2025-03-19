import { apiClient } from './client';
import { authAPI } from './services/authAPI';
import { churchAPI } from './services/churchAPI';
import { memberAPI } from './services/memberAPI';
import { eventAPI } from './services/eventAPI';

/**
 * API services for microservices interaction via the API Gateway
 */
const api = {
  auth: authAPI,
  church: churchAPI,
  member: memberAPI,
  event: eventAPI,
};

export default api;
export { apiClient, authAPI, churchAPI, memberAPI, eventAPI }; 