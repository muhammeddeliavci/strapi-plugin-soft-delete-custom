/**
 * Soft delete metadata fields interface
 */
export interface SoftDeleteFields {
  _softDeletedAt: Date | null;
  _softDeletedById: number | null;
  _softDeletedByType: string | null;
}

/**
 * Content type metadata
 */
export interface ContentTypeInfo {
  uid: string;
  displayName: string;
  kind: 'collectionType' | 'singleType';
  pluralName?: string;
  singularName?: string;
}

/**
 * Restore operation parameters
 */
export interface RestoreParams {
  contentType: string;
  id: string | number;
  user?: any;
}

/**
 * Permanent delete operation parameters
 */
export interface PermanentDeleteParams {
  contentType: string;
  id: string | number;
  user?: any;
}

/**
 * Bulk operation item
 */
export interface BulkOperationItem {
  contentType: string;
  id: string | number;
}

/**
 * Soft deleted entry with metadata
 */
export interface SoftDeletedEntry {
  id: string | number;
  contentType: string;
  title?: string;
  deletedAt: Date;
  deletedById?: number;
  deletedByType?: string;
  [key: string]: any;
}
