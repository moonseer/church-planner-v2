// Authentication configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'church-planner-secret-key-should-be-changed-in-production';
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
export const JWT_COOKIE_EXPIRE = parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10);

// Password reset token expiration (10 minutes)
export const PASSWORD_RESET_EXPIRE = 10 * 60 * 1000; 

// Maximum login attempts before account lock
export const MAX_LOGIN_ATTEMPTS = 5;

// Account lock duration (15 minutes)
export const ACCOUNT_LOCK_TIME = 15 * 60 * 1000; 