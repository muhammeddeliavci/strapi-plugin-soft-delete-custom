# Strapi Plugin: Soft Delete Custom

> Soft delete functionality for Strapi v5.34.0+ with restore capabilities

## Features

- ✅ **Automatic Soft Delete**: All DELETE operations on collection and single types are converted to soft deletes
- ✅ **Transparent Filtering**: Soft deleted entries are automatically excluded from queries
- ✅ **Admin Explorer UI**: Dedicated page to view, restore, and permanently delete entries
- ✅ **RBAC Permissions**: Three-tier permission system (read, restore, delete-permanently)
- ✅ **Bulk Operations**: Restore or permanently delete multiple entries at once
- ✅ **Draft & Publish Support**: Works seamlessly with Strapi's Draft & Publish feature
- ✅ **Single Type Support**: Handles single types correctly
- ✅ **TypeScript**: Full TypeScript support

## Installation

```bash
npm install strapi-plugin-soft-delete-custom
```

## Configuration

Enable the plugin in `config/plugins.ts`:

```typescript
export default {
  'soft-delete-custom': {
    enabled: true,
  },
};
```

Rebuild and restart your Strapi application:

```bash
npm run build
npm run develop
```

## How It Works

### Schema Extension

The plugin automatically adds three fields to all content types during the `register` phase:

- `_softDeletedAt` (datetime): Timestamp when the entry was soft deleted
- `_softDeletedById` (biginteger): ID of the user who deleted the entry
- `_softDeletedByType` (string): Type of user (e.g., "admin", "api")

These fields are marked as `private` and `configurable: false`, so they won't appear in the Content-Type Builder or API responses.

### Entity Service Decoration

The plugin wraps Strapi's entity service methods:

- **`delete()`**: Converts physical delete to UPDATE with soft delete metadata
- **`findMany()`**: Automatically adds `_softDeletedAt: null` filter
- **`findOne()`**: Automatically adds `_softDeletedAt: null` filter
- **`count()`**: Excludes soft deleted entries from counts

### API Endpoints

The plugin provides REST API endpoints for managing soft deleted entries:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/soft-delete-custom/list` | List all soft deleted entries |
| POST | `/api/soft-delete-custom/restore/:contentType/:id` | Restore a single entry |
| POST | `/api/soft-delete-custom/restore-bulk` | Restore multiple entries |
| DELETE | `/api/soft-delete-custom/delete-permanently/:contentType/:id` | Permanently delete an entry |
| DELETE | `/api/soft-delete-custom/delete-permanently-bulk` | Permanently delete multiple entries |

### Admin Panel

Access the Soft Delete Explorer from the admin panel sidebar (requires `plugin::soft-delete-custom.read` permission).

**Features:**
- View all soft deleted entries across content types
- Filter by content type
- Search by entry title
- Restore individual or bulk entries
- Permanently delete individual or bulk entries (with confirmation)
- Pagination

## Permissions

The plugin defines three RBAC permissions:

1. **`plugin::soft-delete-custom.read`**
   - View soft deleted entries in the explorer
   - Access the explorer page

2. **`plugin::soft-delete-custom.restore`**
   - Restore soft deleted entries
   - Requires update permission on the content type

3. **`plugin::soft-delete-custom.delete-permanently`**
   - Permanently delete entries (irreversible)
   - High-risk permission, assign carefully

### Assigning Permissions

1. Go to **Settings → Roles**
2. Select a role (e.g., Editor)
3. Scroll to **Plugins → Soft Delete Custom**
4. Enable desired permissions

## Lifecycle Hooks

**Important:** Soft delete triggers **`beforeUpdate`** and **`afterUpdate`** hooks, NOT `beforeDelete` or `afterDelete`.

Example lifecycle hook:

```typescript
// src/api/article/content-types/article/lifecycles.ts
export default {
  async beforeUpdate(event: any) {
    // Check if this is a soft delete operation
    if (event.params.data._softDeletedAt) {
      console.log('Article is being soft deleted:', event.params.where.id);
    }
  },
};
```

## Known Limitations

### v1.0 Limitations

1. **Components & Dynamic Zones**
   - Soft delete does not cascade to components or dynamic zones
   - If an entry with components is soft deleted, the components remain in the database

2. **Media Files**
   - Media library integration not included in v1.0
   - Uploaded files are not affected by soft delete

3. **Relations**
   - One-to-many and many-to-many relations are not automatically handled
   - Soft deleted entries may still appear in relation fields

4. **Migration from Existing Data**
   - Plugin adds fields on first start via Strapi's schema sync
   - Existing entries will have `_softDeletedAt: null` (active state)

### Workarounds

**Manual Cascade Delete:**
```typescript
// Custom controller or service
async deleteArticleWithRelations(id: number) {
  // Soft delete related comments first
  await strapi.entityService.delete('api::comment.comment', commentId);

  // Then soft delete the article
  await strapi.entityService.delete('api::article.article', id);
}
```

## Migration Guide

### From Strapi v4 Soft Delete Plugins

If you're migrating from a v4 soft delete plugin:

1. **Backup your database** before proceeding
2. Check if your old plugin used different field names (e.g., `deletedAt` vs `_softDeletedAt`)
3. Run a migration script to rename columns if necessary:

```sql
-- Example for PostgreSQL
ALTER TABLE articles RENAME COLUMN deletedAt TO "_softDeletedAt";
ALTER TABLE articles RENAME COLUMN deletedById TO "_softDeletedById";
```

4. Install and enable this plugin
5. Test thoroughly before production deployment

## Troubleshooting

### Soft deleted entries still appear in API

- Check if you're bypassing entity service (e.g., using `strapi.db.query()` directly)
- Ensure you're not disabling filters in your custom controllers

### Permission denied errors

- Verify the user has the required permissions
- Check role configuration in **Settings → Roles**

### Schema sync errors

- Clear Strapi cache: `npm run strapi build --clean`
- Check database permissions for ALTER TABLE operations

## Development

### Building the Plugin

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Running Tests

```bash
# Manual testing checklist
# 1. Create a test article
# 2. Soft delete it via Content Manager
# 3. Verify it doesn't appear in API
# 4. Check explorer shows the soft deleted entry
# 5. Restore it
# 6. Verify it reappears in Content Manager
```

## Roadmap

### v2.0 (Planned)

- [ ] Cascade soft delete for relations
- [ ] Media library integration
- [ ] Retention policies (auto-delete after X days)
- [ ] Audit log for all soft delete operations
- [ ] Content Manager button integration
- [ ] Advanced search in explorer

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for Strapi v5**
