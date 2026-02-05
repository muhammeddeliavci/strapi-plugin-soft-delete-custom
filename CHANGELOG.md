# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-05

### Added
- Initial release for Strapi v5.
- Entity Service decorator for automatic soft delete.
- Database lifecycle hooks for query filtering.
- Auto field injection (_softDeletedAt, _softDeletedById, _softDeletedByType).
- Admin UI Explorer page for managing soft-deleted items.
- Restore service for recovering deleted entities.
- Permanent delete service with RBAC protection.
- TypeScript build pipeline.
- Strapi Marketplace compatibility.