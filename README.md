# Strapi Soft Delete Plugin

> Soft delete functionality for Strapi v5

[![npm version](https://img.shields.io/npm/v/strapi-plugin-soft-delete-custom.svg)](https://www.npmjs.com/package/strapi-plugin-soft-delete-custom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Strapi Version](https://img.shields.io/badge/strapi-v5-purple.svg)](https://strapi.io)

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Soft Delete](#soft-delete)
  - [Restore](#restore)
  - [Permanent Delete](#permanent-delete)
  - [Query Filtering](#query-filtering)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Entity Service Decorator**: Automatically intercepts delete operations to perform soft delete.
- **Lifecycle Hooks**: Filters out soft-deleted items from database queries.
- **Auto Field Injection**: Automatically adds `_softDeletedAt`, `_softDeletedById`, and `_softDeletedByType` fields to content types.
- **Admin UI Explorer**: Dedicated page to view, restore, and permanently delete soft-deleted items.
- **Restore Service**: Programmatic API to restore soft-deleted entities.
- **Permanent Delete**: Irreversible delete capability with RBAC protection.
- **TypeScript Support**: Full TypeScript definitions with JavaScript compatibility.

## Requirements

- **Strapi**: v5.35.0 or higher
- **Node.js**: 18.0.0 or higher
- **npm**: 6.0.0 or higher

## Installation

Using npm:
```bash
npm install strapi-plugin-soft-delete-custom
```

Using yarn:
```bash
yarn add strapi-plugin-soft-delete-custom
```

**Note**: You must rebuild your admin panel after installation:
```bash
npm run build
```

And restart your Strapi server.

## Configuration

### Minimal Configuration

Enable the plugin in `config/plugins.ts`:

```typescript
export default {
  'soft-delete': {
    enabled: true,
  },
};
```

Or in `config/plugins.js`:

```javascript
module.exports = {
  'soft-delete': {
    enabled: true,
  },
};
```

### Multi-Plugin Example

```typescript
export default {
  'users-permissions': {
    config: {
      jwtSecret: process.env.JWT_SECRET,
    },
  },
  'soft-delete': {
    enabled: true,
  },
};
```

No additional options are required. The plugin works without conflicts with other plugins.

## Usage

### Soft Delete

When you delete an entity via the Content Manager or the API (e.g., `DELETE /api/articles/1`), it is **not** removed from the database. Instead, it is marked with a timestamp in the `_softDeletedAt` field.

Example soft-deleted entity structure:
```json
{
  "id": 1,
  "title": "My Article",
  "_softDeletedAt": "2026-02-05T10:00:00.000Z",
  "_softDeletedById": 1,
  "_softDeletedByType": "admin-user"
}
```

### Restore

**Via Admin UI**:
1. Go to "Soft Deleted Items" in the main navigation.
2. Find your item.
3. Click the "Restore" button.

**Programmatic Restore**:
```typescript
// In your custom controller or service
const restored = await strapi
  .plugin('soft-delete')
  .service('restore')
  .restore(uid, id);
```

### Permanent Delete

**Via Admin UI**:
1. Go to "Soft Deleted Items".
2. Click the "Delete Permanently" button (trash icon).
3. Confirm the action.

**Programmatic Permanent Delete**:
```typescript
const deleted = await strapi
  .plugin('soft-delete')
  .service('permanent-delete')
  .delete(uid, id, { confirm: true });
```

**Warning**: This operation is irreversible.

### Query Filtering

**Automatic Filtering**:
Calls to `find` and `findMany` automatically exclude soft-deleted items.

**Querying Soft-Deleted Items**:
To include soft-deleted items, use the filters:

```javascript
// Find only soft-deleted items
strapi.entityService.findMany('api::article.article', {
  filters: {
    _softDeletedAt: {
      $notNull: true
    }
  }
});

// Find active items (default behavior)
strapi.entityService.findMany('api::article.article', {
  filters: {
    _softDeletedAt: {
      $null: true
    }
  }
});
```

## API Reference

### Services

Access services via `strapi.plugin('soft-delete').service('serviceName')`.

#### `restore` service
- `restore(uid: string, id: number | string): Promise<any>`
  - Restores a soft-deleted entity.

#### `permanent-delete` service
- `delete(uid: string, id: number | string, options?: { confirm: boolean }): Promise<any>`
  - Permanently deletes an entity. `confirm: true` is required.

### Permissions

- `plugin::soft-delete.read`: Access the Soft Deleted Items explorer.
- `plugin::soft-delete.restore`: Ability to restore items.
- `plugin::soft-delete.permanent-delete`: Ability to permanently delete items.

### API Endpoints

- `GET /soft-delete/items`: List soft-deleted items.
- `POST /soft-delete/restore/:uid/:id`: Restore an item.
- `DELETE /soft-delete/permanent/:uid/:id`: Permanently delete an item.

## Troubleshooting

### Peer Dependencies
If you encounter peer dependency warnings, you can try:
```bash
npm install strapi-plugin-soft-delete-custom --legacy-peer-deps
```

### Plugin not appearing
Ensure you have run `npm run build` and restarted the server. Check if `enabled: true` is set in `config/plugins.ts`.

### Debugging
Enable debug logs by setting `NODE_ENV=development`.

## Contributing

Pull requests are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE) © 2026