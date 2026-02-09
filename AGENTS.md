# AGENTS.md - Guidelines for AI Coding Agents

## Build Commands

```bash
# Build TypeScript to dist/
npm run build

# Clean build (removes dist/ first)
npm run build:clean

# Validate build output
npm run validate

# Install dependencies
npm install
```

**Note:** No test framework is currently configured. Testing is done manually by linking to a Strapi application.

## Project Structure

This is a **Strapi v5 Plugin** written in TypeScript.

```
src/
├── server/           # Server-side code
│   ├── controllers/  # Request handlers
│   ├── services/     # Business logic
│   ├── routes/       # API route definitions
│   ├── migrations/   # Database migrations
│   ├── index.ts      # Server plugin entry
│   ├── bootstrap.ts  # Startup logic
│   ├── register.ts   # Registration logic
│   └── destroy.ts    # Cleanup logic
├── admin/src/        # Admin UI code
│   ├── pages/        # React components
│   ├── index.ts      # Admin plugin entry
│   └── pluginId.ts   # Plugin ID constant
├── strapi-server.ts  # Server entry point
└── strapi-admin.ts   # Admin entry point
```

## Code Style Guidelines

### TypeScript

- **Target:** ES2021, ESNext modules
- **Strict mode:** Enabled
- **File extensions:** Always use `.js` for imports (ESM requirement), even for `.ts` files
  ```typescript
  // Correct
  import services from './services/index.js';
  // Incorrect
  import services from './services/index';
  ```
- **JSX:** Use `react-jsx` transform (no need to import React)

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `soft-delete-service.ts` |
| Functions | camelCase | `getSoftDeletedItems()` |
| Components | PascalCase | `Explorer` |
| Constants | SCREAMING_SNAKE_CASE | `PLUGIN_ID` |
| Types/Interfaces | PascalCase | `SoftDeleteConfig` |

### Imports

- Group imports: external packages first, then internal modules
- Use named imports for React components from `@strapi/design-system`
- Default exports for services, controllers, and plugin entry points
- Named exports for utility functions and React components

### Error Handling

```typescript
// Use typed errors
try {
  await someOperation();
} catch (error: any) {
  return ctx.badRequest(error.message);
}
```

### Logging

Follow the established log format:
```typescript
strapi.log.info(`Soft Delete: [Service] - [action] details`);
strapi.log.debug(`Soft Delete: [Service] - [action] details`);
```

### Documentation

- Use JSDoc for service methods and complex functions
- Include parameter and return type descriptions

## Strapi Plugin Conventions

### Service Structure
```typescript
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async methodName(params: Type): Promise<ReturnType> {
    // Implementation
  }
});
```

### Controller Structure
```typescript
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async methodName(ctx: any) {
    // Implementation
    return result;
  }
});
```

### Route Configuration
- Admin routes use `type: 'admin'`
- Define permissions using `plugin::soft-delete.permissionName` format

## Important Notes

- **No linting tools** (ESLint/Prettier) are currently configured
- **No test runner** is configured - rely on manual testing
- **Peer dependencies:** Requires `@strapi/strapi ^5.35.0`
- **Node.js:** Requires version 18.0.0 or higher
- Build artifacts go to `dist/` directory (do not edit manually)

## Common Tasks

### Adding a New Service

1. Create file in `src/server/services/`
2. Export default function following the pattern above
3. Register in `src/server/services/index.ts`

### Adding a New Route

1. Add route definition to `src/server/routes/index.ts`
2. Implement handler in `src/server/controllers/`
3. Add corresponding permission string

### Adding Admin UI Components

1. Create React component in `src/admin/src/pages/`
2. Use `@strapi/design-system` components
3. Register in `src/admin/src/index.ts` if it's a new page
