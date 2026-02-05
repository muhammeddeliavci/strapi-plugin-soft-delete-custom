import { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.log.info('Soft Delete Plugin: Cleaning up...');
  // Optional: Remove decorators if we want to be very clean,
  // but Strapi process is usually exiting here.
};
