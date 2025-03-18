# Database Migrations

This directory contains database migration scripts for the Church Planner v2 application.

## Directory Structure

Migration files should follow the naming convention:
`{timestamp}_{description}.ts`

Example: `20230101000000_add_login_attempts_field.ts`

## Running Migrations

Migrations are run using the following commands:

```bash
# Run all pending migrations
npm run migrate

# Create a new migration
npm run migrate:create -- "description_of_migration"

# Roll back the most recent migration
npm run migrate:rollback

# Roll back all migrations
npm run migrate:reset
```

## Migration File Template

```typescript
/**
 * Migration: [description]
 * Created: [date]
 */
import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  // Migration code to apply changes
  // Example: Add a field to a collection
  await db.collection('users').updateMany(
    {},
    { $set: { newField: defaultValue } }
  );
}

export async function down(db: Db): Promise<void> {
  // Migration code to revert changes
  // Example: Remove the added field
  await db.collection('users').updateMany(
    {},
    { $unset: { newField: "" } }
  );
}
```

## Best Practices

1. **Atomic Changes**:
   - Each migration should make one logical change
   - Keep migrations small and focused

2. **Idempotency**:
   - Migrations should be idempotent (can be run multiple times without side effects)
   - Check if changes already exist before applying them

3. **Backward Compatibility**:
   - Ensure application code can work with both pre- and post-migration schema
   - Deploy schema changes before code that uses them

4. **Testing**:
   - Test migrations on a copy of production data
   - Verify both `up` and `down` functions work correctly

5. **Documentation**:
   - Document the purpose of each migration
   - Include any manual steps or precautions 