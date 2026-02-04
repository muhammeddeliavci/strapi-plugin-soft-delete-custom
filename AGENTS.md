# AGENTS.md - AI Coding Guidelines

## Build Commands

```bash
# Build the plugin for production
npm run build

# Watch mode for development
npm run watch

# Verify plugin package
npm run verify
```

## Testing

Currently, this project uses manual testing. Test framework setup is planned.

**Manual testing checklist**: See `TESTING.md` for comprehensive manual testing procedures.

## Code Style Guidelines

### TypeScript Configuration

- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps and declarations enabled
- Extends `@strapi/typescript-utils/tsconfigs/server`

### Imports

- Use `import type { ... }` for type-only imports
- Import order: 1) types, 2) external libs, 3) internal modules
- Strapi types: `import type { Core } from '@strapi/strapi'`

```typescript
import type { Core } from '@strapi/strapi';
import type { SoftDeleteFields } from '../types';
import { addSoftDeleteFields } from './database/migrations';
```

### Formatting

- 2-space indentation
- Single quotes for strings
- Semicolons required
- No trailing commas in multi-line objects
- Max line length: 100 characters (soft limit)

### Types & Naming

- **Interfaces**: PascalCase (e.g., `SoftDeleteFields`, `RestoreParams`)
- **Functions/Variables**: camelCase (e.g., `createRestoreService`)
- **Constants**: UPPER_CASE or camelCase for module-level
- **Private Fields**: Prefix with underscore (e.g., `_softDeletedAt`)
- **Files**: kebab-case (e.g., `soft-delete-controller.ts`)

```typescript
// Interface naming
export interface SoftDeleteFields {
  _softDeletedAt: Date | null;
}

// Function naming
export function createRestoreService(strapi: Core.Strapi) {
  return { ... };
}

// Constants
const PERMISSIONS = {
  read: 'plugin::soft-delete-custom.read',
} as const;
```

### Error Handling

- Use typed errors: `catch (error: any)`
- Throw descriptive error messages with context
- Use `ctx.throw()` in controllers for HTTP errors
- Log errors with appropriate level (info/warn/error)

```typescript
try {
  const result = await operation();
} catch (error: any) {
  strapi.log.error(`[soft-delete] Operation failed: ${error.message}`);
  ctx.throw(400, error.message);
}
```

### Function Structure

- Prefer named exports for utilities
- Use default exports for controllers and main entry points
- Factory pattern for service creation
- Document with JSDoc

```typescript
/**
 * Service for restoring soft deleted entries
 */
export function createRestoreService(strapi: Core.Strapi) {
  return {
    async restore({ contentType, id }: RestoreParams) {
      // Implementation
    },
  };
}
```

### Strapi Plugin Structure

- `register()`: Schema decoration, service wrapping
- `bootstrap()`: Service initialization
- `server()`: Routes, controllers, policies
- `admin()`: Admin panel components

### Comments

- JSDoc for all exported functions
- Section comments for major code blocks
- Log messages prefixed with `[soft-delete]`

```typescript
/**
 * Add soft delete fields to all content type schemas
 * This function modifies schemas at runtime during plugin registration
 */
export function addSoftDeleteFields(strapi: Core.Strapi) {
  // Implementation
}
```

### File Organization

```
src/
├── index.ts              # Plugin entry point
├── types/                # TypeScript interfaces
├── database/             # Schema migrations
├── servers/              # API logic
│   ├── controllers/
│   ├── routes.ts
│   ├── content-api.ts    # Entity service decoration
│   ├── restore-service.ts
│   └── permanent-delete-service.ts
├── admin/                # Admin panel
│   ├── index.ts
│   └── permissions.ts
└── utils/                # Helper functions
```

### API Design

- REST endpoints with clear naming
- Bulk operations supported
- RBAC permission checks required
- Return consistent response format: `{ success, message, data }`

### Database & Strapi Patterns

- Use `strapi.db.query()` for direct database access
- Use `strapi.entityService` for automatic filtering
- Add private fields to schemas: `private: true, configurable: false`
- Decorate entity service methods for transparent behavior

### Security

- Always check permissions before operations
- Validate content type exists
- Log sensitive operations (permanent delete)
- Audit trail in logs with user context

### Debugging

- Use `strapi.log.debug()` for verbose logging
- Use `strapi.log.info()` for operational events
- Use `strapi.log.warn()` for permanent deletions
- Include context in log messages

---

Last updated: 2026-02-04
