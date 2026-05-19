import blogPosts from "./blog.json";

export const blogDetails = blogPosts.map(({ copy, ...post }) => ({
  ...post,
  ...copy.es,
}));

export function getBlogDetailBySlug(slug) {
  return blogDetails.find((post) => post.slug === slug);
}
