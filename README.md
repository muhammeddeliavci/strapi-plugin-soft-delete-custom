# Strapi Soft Delete Plugin

[![npm version](https://img.shields.io/npm/v/@siyahbeyaz/strapi-plugin-soft-delete-custom.svg)](https://www.npmjs.com/package/@siyahbeyaz/strapi-plugin-soft-delete-custom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Strapi Version](https://img.shields.io/badge/strapi-v5-purple.svg)](https://strapi.io)

> A professional soft delete plugin for Strapi v5. Safely delete content with the ability to restore, while maintaining data integrity.

## Features

- **Soft Delete**: Delete items without permanently removing them from the database
- **Restore Functionality**: Easily restore accidentally deleted items via Admin UI
- **Strapi v5 Compatible**: Fully compatible with Strapi v5.35.0 and higher
- **DocumentId Support**: Properly handles Strapi v5's documentId system
- **Admin UI Explorer**: Dedicated page to view and restore soft-deleted items
- **TypeScript Support**: Full TypeScript definitions included
- **Zero Configuration**: Works out of the box with sensible defaults

## Requirements

- Strapi v5.35.0 or higher
- Node.js 18.0.0 or higher
- npm 6.0.0 or higher

## Installation

### From npm (recommended)

```bash
npm install @siyahbeyaz/strapi-plugin-soft-delete-custom
```

### From GitHub

```bash
npm install https://github.com/siyahbeyaz/strapi-plugin-soft-delete-custom/releases/download/v1.1.0/strapi-plugin-soft-delete-custom-1.1.0.tgz
```

### Local tarball

```bash
npm install ./strapi-plugin-soft-delete-custom-1.1.0.tgz
```

## Configuration

Enable the plugin in `config/plugins.ts`:

```typescript
export default {
  'soft-delete': {
    enabled: true,
  },
};
```

Then rebuild and restart:

```bash
npm run build
npm run develop
```

## Usage

### Soft Delete

When you delete an item via the Content Manager or API, it's **not** permanently deleted. Instead:

- `softDeletedAt` field is set to the current timestamp
- `softDeletedById` field records who deleted it
- `softDeletedByType` field records the user type (admin/api)

The item becomes invisible in normal queries but can be restored.

### Restore Deleted Items

1. Go to **Plugins** → **Soft Delete** in the Admin sidebar
2. Select the content type from the dropdown
3. Find your deleted item in the list
4. Click **Restore** button

The item will be immediately restored and visible again in normal queries.

### Programmatic Usage

```typescript
// Restore a soft-deleted entity
const restored = await strapi
  .plugin('soft-delete')
  .service('restore')
  .restore('api::article.article', documentId);
```

## How It Works

### Automatic Field Injection

The plugin automatically adds these fields to all content types:

- `softDeletedAt` (datetime) - When the item was soft deleted
- `softDeletedById` (string) - ID of the user who deleted it
- `softDeletedByType` (string) - Type of user (admin/api)

### Query Filtering

Soft-deleted items are automatically excluded from:
- `find` and `findMany` operations
- Content Manager list views
- API responses

They only appear in the Soft Delete Explorer.

## API Endpoints

All endpoints are prefixed with `/admin` and require authentication.

### List Soft Deleted Items

```
GET /admin/soft-delete/items?modelUid=api::article.article
```

### Restore Item

```
POST /admin/soft-delete/restore/:uid/:id
```

## Permissions

- `plugin::soft-delete.read` - View soft deleted items
- `plugin::soft-delete.restore` - Restore soft deleted items

## Troubleshooting

### Plugin not appearing in Admin

1. Ensure you've run `npm run build`
2. Check that `enabled: true` is set in `config/plugins.ts`
3. Restart the Strapi server

### Items not showing in Soft Delete Explorer

1. Check the browser console for errors
2. Ensure the content type has the `softDeletedAt` field
3. Try refreshing the page

### Migration from Strapi v4

If upgrading from v4, you may need to manually add the soft delete fields to your existing content types or run the migration script.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) © 2026

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/siyahbeyaz/strapi-plugin-soft-delete-custom/issues).

---

**Note**: This plugin is designed for Strapi v5. For Strapi v4, please use a different version.
