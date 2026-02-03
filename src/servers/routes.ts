export default [
  {
    method: 'GET',
    path: '/list',
    handler: 'soft-delete-controller.list',
    config: {
      policies: [
        {
          name: 'plugin::soft-delete-custom.hasPermission',
          config: { permission: 'plugin::soft-delete-custom.read' },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/restore/:contentType/:id',
    handler: 'soft-delete-controller.restore',
    config: {
      policies: [
        {
          name: 'plugin::soft-delete-custom.hasPermission',
          config: { permission: 'plugin::soft-delete-custom.restore' },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/restore-bulk',
    handler: 'soft-delete-controller.restoreBulk',
    config: {
      policies: [
        {
          name: 'plugin::soft-delete-custom.hasPermission',
          config: { permission: 'plugin::soft-delete-custom.restore' },
        },
      ],
    },
  },
  {
    method: 'DELETE',
    path: '/delete-permanently/:contentType/:id',
    handler: 'soft-delete-controller.deletePermanently',
    config: {
      policies: [
        {
          name: 'plugin::soft-delete-custom.hasPermission',
          config: { permission: 'plugin::soft-delete-custom.delete-permanently' },
        },
      ],
    },
  },
  {
    method: 'DELETE',
    path: '/delete-permanently-bulk',
    handler: 'soft-delete-controller.deletePermanentlyBulk',
    config: {
      policies: [
        {
          name: 'plugin::soft-delete-custom.hasPermission',
          config: { permission: 'plugin::soft-delete-custom.delete-permanently' },
        },
      ],
    },
  },
];
