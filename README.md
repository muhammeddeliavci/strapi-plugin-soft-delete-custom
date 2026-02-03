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

## How to Use After Installation

### ⚡ Quick Start (5 Minutes)

#### Step 1: Verify Installation
After restarting Strapi, check the console logs for:
```
[soft-delete-custom] Plugin registered successfully
```

#### Step 2: Check Admin Panel
1. Log in to your Strapi admin panel
2. Look for **"Soft Delete"** in the left sidebar under Plugins section
3. If you don't see it, check your user permissions (see [Permissions](#permissions))

#### Step 3: Test Soft Delete
1. **Create a test entry:**
   - Go to Content Manager
   - Create a new article (or any content type)
   - Save and publish it

2. **Delete the entry:**
   - Click the delete button (trash icon)
   - Confirm deletion
   - ✅ Entry is now soft deleted (not visible in Content Manager)

3. **View in Explorer:**
   - Navigate to **Soft Delete** in the sidebar
   - You'll see your deleted entry in the table
   - Notice the deletion timestamp and user info

4. **Restore the entry:**
   - Click the **"Restore"** button next to the entry
   - Confirm restoration
   - ✅ Entry reappears in Content Manager!

### 🎯 Common Use Cases

#### Use Case 1: Restore Accidentally Deleted Content
```
1. Go to Soft Delete Explorer (sidebar)
2. Search for the deleted entry by name
3. Click "Restore" button
4. Entry is back in Content Manager
```

#### Use Case 2: Permanently Delete Old Content
```
1. Go to Soft Delete Explorer
2. Filter by content type (e.g., "Articles")
3. Select old entries using checkboxes
4. Click "Delete Selected" (permanent)
5. Confirm the warning dialog
```

#### Use Case 3: Bulk Restore Multiple Entries
```
1. Go to Soft Delete Explorer
2. Use checkboxes to select entries
3. Click "Restore Selected" button
4. All selected entries are restored
```

### 🖥️ Admin Panel Features

#### Explorer Table Columns
- **Content Type:** The type of deleted content (e.g., `api::article.article`)
- **ID:** Unique identifier of the entry
- **Title:** Name or title of the deleted entry
- **Deleted At:** When the entry was deleted
- **Deleted By:** User who performed the deletion (or "System")
- **Actions:** Restore or Delete Permanently buttons

#### Filtering & Search
- **Content Type Filter:** Dropdown to show only specific content types
- **Search Bar:** Search by entry title or ID
- **Pagination:** Navigate through pages if you have many deleted entries

#### Bulk Operations
- **Select All:** Checkbox in table header
- **Restore Selected:** Restore multiple entries at once
- **Delete Selected:** Permanently delete multiple entries (⚠️ irreversible)

### 🔌 API Usage

#### List Soft Deleted Entries
```bash
# Get all soft deleted entries
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1337/api/soft-delete-custom/list

# With pagination
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:1337/api/soft-delete-custom/list?page=1&pageSize=25"

# Filter by content type
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:1337/api/soft-delete-custom/list?contentType=api::article.article"
```

#### Restore an Entry
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1337/api/soft-delete-custom/restore/api::article.article/123
```

#### JavaScript Example
```javascript
// Restore an entry using fetch
async function restoreEntry(contentType, id) {
  const response = await fetch(
    `http://localhost:1337/api/soft-delete-custom/restore/${contentType}/${id}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const result = await response.json();
  console.log('Restored:', result);
}

// Example usage
restoreEntry('api::article.article', 123);
```

#### Bulk Restore Example
```javascript
const items = [
  { contentType: 'api::article.article', id: 123 },
  { contentType: 'api::article.article', id: 456 }
];

const response = await fetch(
  'http://localhost:1337/api/soft-delete-custom/restore-bulk',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  }
);

const result = await response.json();
console.log(`Restored: ${result.restored}, Failed: ${result.failed}`);
```

### 🔐 Permission Setup

#### For Admins (Full Access)
Admins automatically have all permissions. No configuration needed.

#### For Editors (View & Restore Only)
1. Go to **Settings → Roles → Editor**
2. Scroll to **Plugins → Soft Delete Custom**
3. Enable:
   - ✅ Read soft deleted entries
   - ✅ Restore soft deleted entries
   - ❌ Delete permanently (leave disabled for safety)
4. Save

#### For Viewers (Read Only)
1. Create a new role: **Settings → Roles → Create**
2. Name it "Soft Delete Viewer"
3. Enable only:
   - ✅ Read soft deleted entries
4. Save

### ❓ Common Questions

**Q: Why don't I see the "Soft Delete" menu?**
A: Check your user role has `plugin::soft-delete-custom.read` permission. Go to **Settings → Roles** and enable it.

**Q: Can I permanently delete without soft delete first?**
A: No, all deletes go through soft delete first. This is by design for safety. Use the explorer to permanently delete soft deleted entries.

**Q: Do soft deleted entries count toward my database limits?**
A: Yes, they remain in the database. Periodically clean up old soft deleted entries using the "Delete Permanently" feature.

**Q: Can I query soft deleted entries in my code?**
A: Yes, use `strapi.db.query()` directly instead of `entityService` to bypass automatic filtering:
```javascript
const softDeleted = await strapi.db.query('api::article.article').findMany({
  where: { _softDeletedAt: { $notNull: true } }
});
```

**Q: Does this work with GraphQL?**
A: Yes, GraphQL queries use the entity service, so soft deleted entries are automatically filtered.

### 🆘 Troubleshooting

**Problem:** Deleted entries still appear in API responses
**Solution:** You might be using `strapi.db.query()` directly. Use `strapi.entityService` instead for automatic filtering.

**Problem:** Can't restore an entry
**Solution:** Check if you have `plugin::soft-delete-custom.restore` permission AND update permission for that content type.

**Problem:** Plugin menu not visible
**Solution:**
1. Verify plugin is enabled in `config/plugins.ts`
2. Run `npm run build`
3. Check user permissions include `read` permission

### 📚 Next Steps

- Read the full [Technical Documentation](#how-it-works) below
- Check [API Endpoints](#api-endpoints) for programmatic access
- Review [Known Limitations](#known-limitations) before production use
- Explore [Lifecycle Hooks](#lifecycle-hooks) for custom behavior

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
