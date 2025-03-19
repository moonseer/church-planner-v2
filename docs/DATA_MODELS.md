# Church Planner - MongoDB Data Models

This document provides a detailed overview of the database models used in the Church Planner application.

## Data Model Relationships

```
User ─┬─── Church ─┬─── ChurchMember
      │            │
      │            ├─── Event ── EventType
      │            │
      └────────────┴─── Team ─── TeamMember
                         │
                         └─── Service
```

## User Model

The User model represents application users who can log in and interact with the system.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| firstName | String | User's first name | Required, max 50 chars |
| lastName | String | User's last name | Required, max 50 chars |
| email | String | User's email address | Required, unique, valid email format |
| password | String | Hashed password | Required, min 6 chars, not returned in queries |
| role | String | User's role in the system | Enum: ['user', 'admin'], default: 'user' |
| churches | [ObjectId] | Churches the user belongs to | References Church model |
| resetPasswordToken | String | Token for password reset | Optional |
| resetPasswordExpire | Date | Expiration for reset token | Optional |
| lastLogin | Date | Last login timestamp | Optional |
| isActive | Boolean | Whether user account is active | Default: true |
| loginAttempts | Number | Failed login attempts count | Default: 0 |
| lockUntil | Date | Account lock expiration time | Optional |
| createdAt | Date | Timestamp of creation | Auto-generated |
| updatedAt | Date | Timestamp of last update | Auto-generated |

### Methods

- `matchPassword(enteredPassword)`: Compares provided password with stored hash
- `getSignedJwtToken()`: Generates a JWT for authentication
- `getResetPasswordToken()`: Generates a token for password reset
- `incrementLoginAttempts()`: Increases login attempts counter, locks account if needed
- `clearLoginAttempts()`: Resets login attempts counter

### Virtuals

- `fullName`: Combines firstName and lastName

### Indexes

- `email`: For faster user lookup by email

## Church Model

The Church model represents a church organization in the system.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| name | String | Church name | Required, max 100 chars |
| description | String | Church description | Max 1000 chars |
| location | Object | Physical location | |
| location.address | String | Street address | |
| location.city | String | City | |
| location.state | String | State/province | |
| location.zipCode | String | Postal code | |
| location.country | String | Country | |
| contact | Object | Contact information | |
| contact.phone | String | Phone number | |
| contact.email | String | Email address | Valid email format |
| contact.website | String | Website URL | |
| denomination | String | Religious denomination | |
| pastorName | String | Name of lead pastor | |
| serviceTime | String | Regular service times | |
| foundedYear | Number | Year church was founded | |
| members | [ObjectId] | Users who are members | References User model |
| admins | [ObjectId] | Users who can administer | References User model |
| createdAt | Date | Timestamp of creation | Auto-generated |
| updatedAt | Date | Timestamp of last update | Auto-generated |

## ChurchMember Model

The ChurchMember model represents individual members of a church congregation, with more detailed information than the basic User model.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| firstName | String | Member's first name | Required, max 50 chars |
| lastName | String | Member's last name | Required, max 50 chars |
| email | String | Email address | Valid email format |
| phone | String | Phone number | |
| address | Object | Physical address | |
| address.street | String | Street address | |
| address.city | String | City | |
| address.state | String | State/province | |
| address.zipCode | String | Postal code | |
| address.country | String | Country | |
| dateOfBirth | Date | Birth date | |
| joinDate | Date | Date joined the church | Default: current date |
| membershipStatus | String | Status in the church | Enum: ['Active', 'Inactive', 'Visitor', 'Regular Attendee', 'Member'], default: 'Visitor' |
| baptismDate | Date | Date of baptism | |
| gender | String | Gender | Enum: ['Male', 'Female', 'Other', 'Prefer not to say'] |
| familyMembers | [ObjectId] | Related family members | References ChurchMember model |
| notes | String | Additional information | Max 1000 chars |
| church | ObjectId | Church they belong to | Required, references Church model |
| isActive | Boolean | Active status | Default: true |
| attendanceRecord | [Object] | Record of attendance | |
| attendanceRecord.date | Date | Date of service/event | Required |
| attendanceRecord.attended | Boolean | Whether they attended | Default: false |
| ministry | [String] | Ministries they serve in | |
| profession | String | Professional occupation | |
| createdAt | Date | Timestamp of creation | Auto-generated |
| updatedAt | Date | Timestamp of last update | Auto-generated |

### Virtuals

- `fullName`: Combines firstName and lastName
- `age`: Calculated from dateOfBirth

### Indexes

- `{ firstName: 1, lastName: 1, church: 1 }`: For name-based searches within a church
- `{ email: 1, church: 1 }`: For email-based searches within a church

## Event Model

The Event model represents scheduled events for churches.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| title | String | Event title | Required, max 100 chars |
| description | String | Event description | Max 1000 chars |
| start | Date | Start date and time | Required |
| end | Date | End date and time | Required |
| allDay | Boolean | Whether it's an all-day event | Default: false |
| location | String | Event location | Max 200 chars |
| eventType | ObjectId | Type of event | Required, references EventType model |
| church | ObjectId | Associated church | Required, references Church model |
| createdBy | ObjectId | User who created the event | Required, references User model |
| createdAt | Date | Timestamp of creation | Default: current date |

### Indexes

- `{ start: 1, end: 1 }`: For date range queries
- `{ church: 1 }`: For filtering by church

## EventType Model

The EventType model defines categories for church events.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| name | String | Event type name | Required, max 50 chars |
| description | String | Description of event type | Max 200 chars |
| color | String | Color code for UI display | |
| church | ObjectId | Associated church | Required, references Church model |
| createdAt | Date | Timestamp of creation | Default: current date |

## Team Model

The Team model represents ministry teams within a church.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| name | String | Team name | Required, max 50 chars |
| description | String | Team description | Max 200 chars |
| church | ObjectId | Associated church | Required, references Church model |
| leader | ObjectId | Team leader | References User model |
| createdAt | Date | Timestamp of creation | Default: current date |

## TeamMember Model

The TeamMember model represents membership in ministry teams.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| team | ObjectId | Team they belong to | Required, references Team model |
| member | ObjectId | User who is a member | Required, references User model |
| role | String | Role within the team | |
| joinDate | Date | Date joined the team | Default: current date |
| isActive | Boolean | Active status | Default: true |
| createdAt | Date | Timestamp of creation | Default: current date |

## Service Model

The Service model represents church services/worship events.

### Schema

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| title | String | Service title | Required, max 100 chars |
| date | Date | Service date | Required |
| startTime | Date | Start time | Required |
| endTime | Date | End time | Required |
| description | String | Service description | Max 500 chars |
| sermonTitle | String | Title of sermon | |
| sermonSpeaker | String | Name of speaker | |
| sermonNotes | String | Sermon notes | |
| serviceType | String | Type of service | Enum: ['Sunday', 'Midweek', 'Special'] |
| teams | [ObjectId] | Teams serving | References Team model |
| church | ObjectId | Associated church | Required, references Church model |
| createdBy | ObjectId | User who created the record | Required, references User model |
| createdAt | Date | Timestamp of creation | Default: current date |
| updatedAt | Date | Timestamp of last update | Auto-generated |

### Indexes

- `{ date: 1, church: 1 }`: For filtering services by date and church 