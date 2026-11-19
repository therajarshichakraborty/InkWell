import { Router } from "express";
import { requireAuth } from "./middleware/auth.js";
import { commentsRoutes, postCommentsRoutes } from "./modules/comments/comments.routes.js";
import { engagementRoutes, myBookmarksRoutes } from "./modules/engagement/engagement.routes.js";
import { followsRoutes, myFeedRoutes } from "./modules/follows/follows.routes.js";
import { myPostsRoutes, postsRoutes } from "./modules/posts/posts.routes.js";
import { searchRoutes } from "./modules/search/search.routes.js";
import { mySeriesRoutes } from "./modules/series/series.routes.js";
import { statsRoutes } from "./modules/stats/stats.routes.js";
import { tagsRoutes } from "./modules/tags/tags.routes.js";
import { uploadsRoutes } from "./modules/uploads/uploads.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";

const me = Router()
  .use(requireAuth)
  .use("/posts", myPostsRoutes)
  .use("/series", mySeriesRoutes)
  .use("/feed", myFeedRoutes)
  .use("/bookmarks", myBookmarksRoutes);

export const apiRoutes = Router()
  .use("/posts", postsRoutes, engagementRoutes, postCommentsRoutes)
  .use("/comments", commentsRoutes)
  .use("/users", usersRoutes, followsRoutes)
  .use("/tags", tagsRoutes)
  .use("/search", searchRoutes)
  .use("/stats", statsRoutes)
  .use("/uploads", uploadsRoutes)
  .use("/me", me);
