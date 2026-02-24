/**
 * Serialization helpers — convert Mongoose documents to plain objects.
 * Eliminates the repeated _id.toString() boilerplate in every action.
 */

export function serializeCategory(cat: any) {
  if (!cat) return null;
  return {
    ...cat,
    _id: cat._id?.toString?.() ?? cat._id,
  };
}

export function serializeAuthor(author: any) {
  if (!author) return null;
  return {
    ...author,
    _id: author._id?.toString?.() ?? author._id,
  };
}

export function serializePost(post: any) {
  if (!post) return null;
  return {
    ...post,
    _id: post._id?.toString?.() ?? post._id,
    category: serializeCategory(post.category),
    author: serializeAuthor(post.author),
    likes: post.likes
      ? post.likes.map((id: any) =>
          typeof id === "object" ? id.toString() : id,
        )
      : [],
  };
}
