# Database Migrations

## Setup

```bash
npm install node-pg-migrate
```

## Configuration

Create `migrations.config.js`:

```javascript
module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
  direction: 'up',
  count: Infinity,
  ignorePattern: '.*\\.map',
  schema: 'public'
};
```

## Commands

### Create migration
```bash
npm run migrate:create add-user-preferences
```

### Run migrations
```bash
npm run migrate:up
```

### Rollback migration
```bash
npm run migrate:down
```

### Check status
```bash
npm run migrate:status
```

## Migration Template

```javascript
exports.up = (pgm) => {
  pgm.createTable('table_name', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('table_name');
};
```

## Best Practices

1. Always write both `up` and `down` migrations
2. Test migrations on development database first
3. Backup production database before running migrations
4. Keep migrations small and focused
5. Never modify existing migrations after they've been run in production
