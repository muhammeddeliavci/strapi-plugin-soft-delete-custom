# Testing Checklist

## Manual Testing Guide

### 1. Collection Type Soft Delete

- [ ] Create a new article in Content Manager
- [ ] Delete the article
- [ ] Verify `_softDeletedAt` is set in database
- [ ] Verify article doesn't appear in Content Manager list
- [ ] Verify GET `/api/articles` doesn't return the deleted article
- [ ] Check soft delete explorer shows the article

### 2. Collection Type Restore

- [ ] Open soft delete explorer
- [ ] Find the soft deleted article
- [ ] Click "Restore" button
- [ ] Confirm restoration
- [ ] Verify article reappears in Content Manager
- [ ] Verify GET `/api/articles` returns the article
- [ ] Verify `_softDeletedAt` is NULL in database

### 3. Single Type Soft Delete

- [ ] Create/update a single type (e.g., About Page)
- [ ] Delete the single type entry
- [ ] Verify GET `/api/about-page` returns null or 404
- [ ] Verify entry still exists in database with `_softDeletedAt` set
- [ ] Check soft delete explorer shows the entry

### 4. Single Type Restore

- [ ] Open soft delete explorer
- [ ] Find the soft deleted single type entry
- [ ] Restore it
- [ ] Verify GET `/api/about-page` returns the entry
- [ ] Verify single type is editable in Content Manager

### 5. Draft & Publish Mode

- [ ] Create an entry with Draft & Publish enabled
- [ ] Publish the entry
- [ ] Delete the entry (both draft and published versions should be soft deleted)
- [ ] Verify neither version appears in queries
- [ ] Restore the entry
- [ ] Verify published version is restored correctly

### 6. RBAC Permissions - Read

- [ ] Create a custom role "Viewer" with only `plugin::soft-delete-custom.read` permission
- [ ] Assign a user to this role
- [ ] Log in as this user
- [ ] Verify Soft Delete menu item appears
- [ ] Verify user can view soft deleted entries
- [ ] Verify "Restore" and "Delete Permanently" buttons are disabled or hidden

### 7. RBAC Permissions - Restore

- [ ] Create a role "Editor" with `read` and `restore` permissions
- [ ] Log in as Editor
- [ ] Verify user can restore entries
- [ ] Verify user cannot permanently delete entries

### 8. RBAC Permissions - Delete Permanently

- [ ] Create a role "Admin" with all three permissions
- [ ] Soft delete an entry
- [ ] Log in as Admin
- [ ] Permanently delete the entry from explorer
- [ ] Verify entry is completely removed from database
- [ ] Verify entry cannot be restored

### 9. API Filtering

**Test automatic filtering:**

- [ ] Soft delete 3 articles
- [ ] Call GET `/api/articles`
- [ ] Verify only non-deleted articles are returned
- [ ] Call GET `/api/articles?pagination[limit]=100`
- [ ] Verify soft deleted entries are excluded from pagination

**Test count:**

- [ ] Soft delete 2 articles out of 10
- [ ] Call GET `/api/articles` with pagination
- [ ] Verify `meta.pagination.total` is 8, not 10

### 10. Bulk Operations

**Bulk Restore:**

- [ ] Soft delete 5 entries
- [ ] Open soft delete explorer
- [ ] Select 3 entries using checkboxes
- [ ] Click "Restore Selected"
- [ ] Verify all 3 are restored
- [ ] Verify 2 remain in soft delete state

**Bulk Permanent Delete:**

- [ ] Soft delete 5 entries
- [ ] Select 3 entries
- [ ] Click "Delete Selected"
- [ ] Confirm the strong warning
- [ ] Verify entries are permanently removed from database

### 11. Search and Filtering

- [ ] Soft delete entries from multiple content types (articles, pages, categories)
- [ ] Open soft delete explorer
- [ ] Use content type filter to show only articles
- [ ] Search for a specific entry by title
- [ ] Verify search results are accurate

### 12. Pagination

- [ ] Soft delete 50+ entries
- [ ] Open soft delete explorer
- [ ] Verify pagination controls appear
- [ ] Navigate to page 2
- [ ] Verify correct entries are displayed
- [ ] Verify page count is correct

### 13. Lifecycle Hooks

**Create a test lifecycle:**

```typescript
// src/api/article/content-types/article/lifecycles.ts
export default {
  async beforeUpdate(event: any) {
    if (event.params.data._softDeletedAt) {
      console.log('SOFT DELETE:', event.params.where.id);
    } else if (event.params.data._softDeletedAt === null) {
      console.log('RESTORE:', event.params.where.id);
    }
  },
};
```

- [ ] Soft delete an article
- [ ] Check logs for "SOFT DELETE" message
- [ ] Restore the article
- [ ] Check logs for "RESTORE" message
- [ ] Verify `beforeDelete` is NOT triggered

### 14. Error Handling

- [ ] Try to restore a non-existent entry ID
- [ ] Verify proper error message
- [ ] Try to restore an already-active entry
- [ ] Verify idempotent behavior (success message)
- [ ] Try to permanently delete an active entry (not soft deleted)
- [ ] Verify error: "Entry must be soft deleted first"

### 15. Plugin Disable/Enable

- [ ] Soft delete some entries with plugin enabled
- [ ] Disable plugin in `config/plugins.ts`
- [ ] Restart Strapi
- [ ] Verify DELETE operations now physically delete
- [ ] Verify soft deleted entries remain in database
- [ ] Re-enable plugin
- [ ] Verify soft delete behavior resumes

## Automated Testing (Future)

### Unit Tests

- [ ] Test `addSoftDeleteFields()` function
- [ ] Test `decorateEntityService()` wrapper functions
- [ ] Test restore service logic
- [ ] Test permanent delete service logic

### Integration Tests

- [ ] Test full soft delete → restore → permanent delete flow
- [ ] Test RBAC permission enforcement
- [ ] Test API endpoint responses

### E2E Tests

- [ ] Test admin UI interactions (Playwright/Cypress)
- [ ] Test explorer page functionality
- [ ] Test bulk operations

## Performance Testing

- [ ] Benchmark query performance with 10,000 entries (5,000 soft deleted)
- [ ] Verify index on `_softDeletedAt` is used
- [ ] Test pagination with large datasets
- [ ] Monitor memory usage during bulk operations

## Compatibility Testing

- [ ] PostgreSQL database
- [ ] MySQL database
- [ ] SQLite database
- [ ] MongoDB (if supported by Strapi v5)

## Edge Cases

- [ ] Soft delete an entry, then try to create a new entry with the same unique field
- [ ] Soft delete parent entry with relations
- [ ] Restore entry after related entries have been permanently deleted
- [ ] Concurrent restore operations on the same entry

---

## Test Results Template

```
Date: YYYY-MM-DD
Tester: [Name]
Strapi Version: 5.x.x
Database: [PostgreSQL/MySQL/SQLite]

| Test Case | Status | Notes |
|-----------|--------|-------|
| Collection Type Soft Delete | ✅ PASS | |
| Collection Type Restore | ✅ PASS | |
| Single Type Soft Delete | ✅ PASS | |
| ... | | |

Overall Result: ✅ PASS / ❌ FAIL
```
