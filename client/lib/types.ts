export type PostStatus = "draft" | "published";

export type SeriesRef = {
  name: string;
  slug: string;
};

export type TagRef = {
  name: string;
  slug: string;
};

export type Tag = TagRef & {
  postCount: number;
};

export type AuthorRef = {
  name: string;
  username: string;
  image: string | null;
};

export type Author = AuthorRef & {
  bio: string;
};

export type Blog = {
  author: Author & { joinedAt: string };
  series: SeriesRef[];
  stats: { followers: number; following: number; posts: number };
  viewer: { isSelf: boolean; following: boolean };
};

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  readingTime: number;
  publishedAt: string;
  author: AuthorRef;
  series: SeriesRef | null;
  likeCount: number;
  commentCount: number;
};

export type Post = PostSummary & {
  html: string;
  updatedAt: string;
  liked: boolean;
  bookmarked: boolean;
  tags: TagRef[];
};

export type AuthorPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  series: SeriesRef | null;
};

export type EditablePost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage: string | null;
  seriesId: string | null;
  status: PostStatus;
  publishedAt: string | null;
  tags: string[];
};

export type Series = SeriesRef & {
  id: string;
  postCount: number;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: AuthorRef;
};

export type TagPage = {
  tag: TagRef;
  posts: PostSummary[];
};

export type SearchResults = {
  users: Author[];
  posts: PostSummary[];
  tags: Tag[];
};

export type PlatformStats = {
  writers: number;
  posts: number;
  tags: number;
  likes: number;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  image: string | null;
};

export type Session = {
  user: SessionUser;
};
