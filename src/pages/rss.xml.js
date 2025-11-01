import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog-posts');
  const site = 'https://luciacerchie.dev';
  
  return rss({
    title: 'Lucia Cerchie',
    description: 'Developer. Teacher. Tinkerer.',
    site: site,
    items: posts.map((post) => ({
      link: `/blog/${post.slug}/`,
      title: post.data.title,
      pubDate: new Date(post.data.publishDate),
      description: post.data.description
    }))
  });
}