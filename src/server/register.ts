import { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Register permissions
  const actionProvider = (strapi as any).admin?.services?.permission?.actionProvider;

  if (actionProvider) {
    await actionProvider.registerMany([
      {
        section: 'plugins',
        displayName: 'Read soft-deleted items',
        uid: 'read',
        pluginName: 'soft-delete',
      },
      {
        section: 'plugins',
        displayName: 'Restore soft-deleted items',
        uid: 'restore',
        pluginName: 'soft-delete',
      },
      {
        section: 'plugins',
        displayName: 'Permanently delete items',
        uid: 'permanent-delete',
        pluginName: 'soft-delete',
      },
    ]);
  }
};
