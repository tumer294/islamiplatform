// API Client for PostgreSQL backend
const API_BASE = '/api';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  type: string;
  media_url?: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  users: User;
}

export interface DuaRequest {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_urgent: boolean;
  is_anonymous: boolean;
  tags: string[];
  prayers_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  users: User;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  is_private: boolean;
  cover_image?: string;
  location?: string;
  member_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  users: User;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  location_name: string;
  location_address: string;
  location_city: string;
  organizer_name: string;
  organizer_contact?: string;
  capacity: number;
  attendees_count: number;
  price: string;
  is_online: boolean;
  image_url?: string;
  tags: string[];
  requirements: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  users: User;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id?: string;
  dua_request_id?: string;
  content: string;
  is_prayer: boolean;
  created_at: string;
  updated_at: string;
  users: User;
}

// API Helper functions
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<{ data: T | null; error: any }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      return { data: null, error: errorData };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Database helper functions
export const dbHelpers = {
  // Users
  async getUser(userId: string): Promise<{ data: User | null; error: any }> {
    return apiRequest<User>(`/users/${userId}`);
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<{ data: User | null; error: any }> {
    return apiRequest<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Posts
  async getPosts(limit = 20, offset = 0, filterTag?: string): Promise<{ data: Post[]; error: any }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (filterTag) params.append('tag', filterTag);
    
    const queryString = params.toString();
    const result = await apiRequest<Post[]>(`/posts${queryString ? `?${queryString}` : ''}`);
    return { data: result.data || [], error: result.error };
  },

  async createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'shares_count' | 'users'>): Promise<{ data: Post | null; error: any }> {
    return apiRequest<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  async deletePost(postId: string, userId: string): Promise<{ data: any; error: any }> {
    return apiRequest(`/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  // Likes
  async toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ data: { liked: boolean }; error: any }> {
    const result = await apiRequest<{ liked: boolean }>('/likes', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, post_id: postId, dua_request_id: duaRequestId }),
    });
    return { data: result.data || { liked: false }, error: result.error };
  },

  async getUserLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ data: { liked: boolean }; error: any }> {
    const params = new URLSearchParams();
    if (postId) params.append('post_id', postId);
    if (duaRequestId) params.append('dua_request_id', duaRequestId);
    
    const result = await apiRequest<{ liked: boolean }>(`/likes/${userId}?${params.toString()}`);
    return { data: result.data || { liked: false }, error: result.error };
  },

  // Comments
  async getComments(postId?: string, duaRequestId?: string): Promise<{ data: Comment[]; error: any }> {
    const endpoint = postId ? `/comments/post/${postId}` : `/comments/dua/${duaRequestId}`;
    const result = await apiRequest<Comment[]>(endpoint);
    return { data: result.data || [], error: result.error };
  },

  async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'users'>): Promise<{ data: Comment | null; error: any }> {
    return apiRequest<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },

  // Bookmarks
  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ data: { bookmarked: boolean } | null; error: any }> {
    return apiRequest<{ bookmarked: boolean }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, post_id: postId, dua_request_id: duaRequestId }),
    });
  },

  // Dua Requests
  async getDuaRequests(limit = 20, offset = 0): Promise<{ data: DuaRequest[]; error: any }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    const result = await apiRequest<DuaRequest[]>(`/dua-requests${queryString ? `?${queryString}` : ''}`);
    return { data: result.data || [], error: result.error };
  },

  async createDuaRequest(duaRequest: Omit<DuaRequest, 'id' | 'created_at' | 'updated_at' | 'prayers_count' | 'comments_count' | 'users'>): Promise<{ data: DuaRequest | null; error: any }> {
    return apiRequest<DuaRequest>('/dua-requests', {
      method: 'POST',
      body: JSON.stringify(duaRequest),
    });
  },

  // Communities
  async getCommunities(): Promise<{ data: Community[]; error: any }> {
    const result = await apiRequest<Community[]>('/communities');
    return { data: result.data || [], error: result.error };
  },

  async createCommunity(community: Omit<Community, 'id' | 'created_at' | 'updated_at' | 'member_count' | 'users'>): Promise<{ data: Community | null; error: any }> {
    return apiRequest<Community>('/communities', {
      method: 'POST',
      body: JSON.stringify(community),
    });
  },

  async joinCommunity(communityId: string, userId: string): Promise<{ data: any; error: any }> {
    return apiRequest(`/communities/${communityId}/join`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // Events
  async getEvents(): Promise<{ data: Event[]; error: any }> {
    const result = await apiRequest<Event[]>('/events');
    return { data: result.data || [], error: result.error };
  },

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'attendees_count' | 'users'>): Promise<{ data: Event | null; error: any }> {
    return apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async attendEvent(eventId: string, userId: string): Promise<{ data: any; error: any }> {
    return apiRequest(`/events/${eventId}/attend`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

// Auth helpers
export const authHelpers = {
  async signUp(email: string, password: string, metadata: any): Promise<{ user: User | null; error: any }> {
    const { data, error } = await apiRequest<{ user: User; error: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name: metadata.full_name, username: metadata.username }),
    });
    
    if (error) return { user: null, error };
    return { user: data?.user || null, error: data?.error };
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await apiRequest<{ user: User; error: any }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    if (error) return { user: null, error };
    return { user: data?.user || null, error: data?.error };
  },
};

// Check if we have valid database configuration
export const isSupabaseConfigured = true; // Always true now since we use our own backend