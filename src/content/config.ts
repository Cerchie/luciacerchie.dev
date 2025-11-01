import { defineCollection, z } from 'astro:content';

const blogPosts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
  }),
});

export const collections = {
  'blog-posts': blogPosts,
};