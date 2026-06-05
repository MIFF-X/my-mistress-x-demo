export function createWallOfShameBoard(posts = []) {
  return {
    id: 'site-wall-of-shame',
    posts: Array.isArray(posts) ? posts : [],
    visibility: 'public',
  };
}
