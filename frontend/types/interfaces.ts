export interface Filters {
  categories: string[];
  users: string;
  ageRange: string;
  sortBy: string;
  searchQuery: string;
}

export interface ControlsPanelProps {
  filters: Filters;
  onUpdateFilters: (newFilters: Filters) => void;
}

export interface PostData {
  post_id: number;
  poster_id: number;
  title: string;
  body: string;
  category: string;
  image_url: string;
  like_count: number;
  reply_count: number;
  created_at: string;
  username: string;
  profile_picture?: string;
  liked: boolean;
}

export interface ReplyData {
  reply_id: number;
  post_id: number;
  replier_id: number;
  body: string;
  image_url?: string;
  like_count: number;
  created_at: string;
  username: string;
  profile_picture?: string;
  liked: boolean;
}

export interface CreateReplyProps {
  postId: number;
}

export interface UserData {
  user_id: number;
  username: string;
  profile_picture?: string;
}

export interface CreatePostProps {
  onClose: () => void;
}

export interface FeedProps {
  filters?: Filters & { posterId?: number };
}

export interface FiltersProps {
  currentFilters: Filters;
  onUpdateFilters: (filters: Filters) => void;
  onClose: () => void;
}

export interface PostProps {
  post_id: number;
  poster_id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  image_url?: string;
  username: string;
  profile_picture?: string;
  liked: boolean;
}

export interface ReplyFeedProps {
  replies: ReplyData[];
}
export interface ReplyProps {
  reply_id: number;
  post_id: number;
  replier_id: number;
  body: string;
  image_url?: string;
  like_count: number;
  created_at: string;
  username: string;
  profile_picture?: string;
  liked: boolean;
}

export interface UserProps {
  user_id: number;
}

export interface AuthData {
  user: { user_id: number; is_admin: boolean } | null;
  token: string | null;
  setToken: (token: string | null) => void;
}
