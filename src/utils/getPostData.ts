import type { CollectionEntry } from 'astro:content';
import getReadingTime from 'reading-time';

export default function getPostData(post: CollectionEntry<'blog-posts'>) {
  return {
    slug: post.slug,
    readingTime: getReadingTime(post.body).text
  };
}
