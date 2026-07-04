import blogPosts from "./blog.json";

export function getBlogDetails() {
  return blogPosts.map(({ copy, ...post }) => ({
    ...post,
    ...copy.es,
  }));
}

export function getBlogDetailBySlug(slug) {
  return getBlogDetails().find((post) => post.slug === slug);
}
