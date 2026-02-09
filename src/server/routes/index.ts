export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/items',
        handler: 'softDelete.getSoftDeletedItems',
        config: {
          permissions: ['plugin::soft-delete.read'],
        },
      },
      {
        method: 'POST',
        path: '/restore/:uid/:id',
        handler: 'softDelete.restore',
        config: {
          permissions: ['plugin::soft-delete.restore'],
        },
      },
      {
        method: 'POST',
        path: '/permanent/:uid/:id',
        handler: 'softDelete.permanentDelete',
        config: {
          permissions: ['plugin::soft-delete.permanent-delete'],
        },
      },
    ],
  },
};
