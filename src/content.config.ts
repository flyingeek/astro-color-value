import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: (context) =>
      docsSchema()(context).extend({
        heroImageWidth: z.number().int().positive().optional(),
        heroImageHeight: z.number().int().positive().optional(),
        heroImageRotate: z.number().optional(),
      }),
  }),
};
