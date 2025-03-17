# Password Policy & Account Security

## Password Requirements

The Church Planner application enforces the following password requirements:

1. **Minimum Length**: Passwords must be at least 8 characters long.
2. **Complexity Requirements**:
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one number (0-9)
   - At least one special character (e.g., !@#$%^&*)

## Account Locking

To prevent brute force attacks, the application implements an account locking mechanism:

1. **Failed Login Attempts**: After 5 consecutive failed login attempts, the account will be locked.
2. **Lock Duration**: Locked accounts remain locked for 15 minutes.
3. **Counter Reset**: The failed attempt counter is reset after:
   - A successful login
   - Password reset
   - When the lock period expires

## Implementation Details

### Password Validation

Password validation is performed using a custom validator function that checks for the requirements listed above. This validation occurs:

1. When a user registers
2. When a user changes their password
3. During password reset operations

### Account Locking Implementation

The account locking mechanism is implemented using the following fields in the User model:

- `loginAttempts`: Tracks the number of consecutive failed login attempts
- `lockUntil`: Timestamp indicating when the account lock expires
- `passwordLastChanged`: Timestamp of the last password change

### Security Considerations

1. **Password Storage**: All passwords are hashed using bcrypt with a salt of 10 rounds.
2. **Password Age**: The system tracks when passwords were last changed to support password expiration policies.
3. **Secure Authentication**: Authentication is performed using HTTP-only cookies and JWT tokens.
4. **Rate Limiting**: In addition to account locking, API rate limiting is applied to authentication endpoints.

## Future Enhancements

The following enhancements are planned for future releases:

1. **Password Expiration**: Require password changes after a configurable period (e.g., 90 days).
2. **Password History**: Prevent reuse of previous passwords.
3. **Two-Factor Authentication**: Add support for 2FA using authenticator apps or SMS.
4. **Risk-Based Authentication**: Implement additional verification for logins from new devices or locations.
5. **Gradual Backoff**: Increase lockout duration for repeated failed attempts after lock expiration.

## Implementation Code

The password policy is implemented in the User model:

```typescript
// Password validation function
const validatePassword = (password: string): boolean => {
  // At least 8 characters long
  if (password.length < 8) return false;
  
  // Contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Contains at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Contains at least one number
  if (!/[0-9]/.test(password)) return false;
  
  // Contains at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
};
```

The account locking mechanism is implemented in the login controller and User model methods. 