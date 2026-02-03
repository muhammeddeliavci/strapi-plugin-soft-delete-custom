import type { Core } from '@strapi/strapi';
import type { ContentTypeInfo } from '../types';

/**
 * Get content type display name from UID
 */
export function getContentTypeDisplayName(strapi: Core.Strapi, uid: string): string {
  const contentType = strapi.contentTypes[uid];

  if (!contentType) {
    return uid;
  }

  const schema = contentType as any;
  return schema.info?.displayName || schema.info?.singularName || uid.split('.').pop() || uid;
}

/**
 * Extract title/name field from entry dynamically
 * Looks for common title fields like: title, name, label, displayName
 */
export function extractEntryTitle(entry: any, contentType?: any): string {
  if (!entry) return 'Untitled';

  // Common title fields in order of preference
  const titleFields = ['title', 'name', 'label', 'displayName', 'heading', 'subject'];

  for (const field of titleFields) {
    if (entry[field] && typeof entry[field] === 'string') {
      return entry[field];
    }
  }

  // If no title field found, return ID
  return entry.id ? `Entry #${entry.id}` : 'Untitled';
}

/**
 * Get all content types that support soft delete
 */
export function getSoftDeleteEnabledContentTypes(strapi: Core.Strapi): ContentTypeInfo[] {
  const contentTypes: ContentTypeInfo[] = [];

  for (const [uid, contentType] of Object.entries(strapi.contentTypes)) {
    if (contentType.kind === 'collectionType' || contentType.kind === 'singleType') {
      const schema = contentType as any;
      contentTypes.push({
        uid,
        displayName: schema.info?.displayName || uid,
        kind: contentType.kind,
        pluralName: schema.info?.pluralName,
        singularName: schema.info?.singularName,
      });
    }
  }

  return contentTypes.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Format soft delete metadata for display
 */
export function formatSoftDeleteMetadata(entry: any) {
  return {
    deletedAt: entry._softDeletedAt ? new Date(entry._softDeletedAt) : null,
    deletedById: entry._softDeletedById,
    deletedByType: entry._softDeletedByType || 'unknown',
    title: extractEntryTitle(entry),
  };
}
