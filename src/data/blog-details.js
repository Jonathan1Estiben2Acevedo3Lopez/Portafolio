import { readFileSync } from "node:fs";
import path from "node:path";

const blogDataPath = path.join(process.cwd(), "src", "data", "blog.json");

function readBlogPosts() {
  return JSON.parse(readFileSync(blogDataPath, "utf8"));
}

export function getBlogDetails() {
  return readBlogPosts().map(({ copy, ...post }) => ({
    ...post,
    ...copy.es,
  }));
}

export function getBlogDetailBySlug(slug) {
  return getBlogDetails().find((post) => post.slug === slug);
}
