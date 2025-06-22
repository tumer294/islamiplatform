// Legacy Supabase compatibility layer - redirects to new PostgreSQL API
const API_BASE = '/api';

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

// Auth helpers
export const authHelpers = {
  async signUp(email: string, password: string, metadata: any): Promise<{ user: any | null; error: any }> {
    const { data, error } = await apiRequest<{ user: any; error: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name: metadata.full_name, username: metadata.username }),
    });
    
    if (error) return { user: null, error };
    return { user: data?.user || null, error: data?.error };
  },

  async signIn(email: string, password: string): Promise<{ user: any | null; error: any }> {
    const { data, error } = await apiRequest<{ user: any; error: any }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    if (error) return { user: null, error };
    return { user: data?.user || null, error: data?.error };
  },
};

// Database helpers
export const dbHelpers = {
  async getPosts(limit = 20, offset = 0, filterTag?: string) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (filterTag) params.append('tag', filterTag);
    
    const queryString = params.toString();
    const result = await apiRequest(`/posts${queryString ? `?${queryString}` : ''}`);
    return { data: result.data || [], error: result.error };
  },

  async createPost(post: any) {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  async deletePost(postId: string, userId: string) {
    return apiRequest(`/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  async toggleLike(userId: string, postId?: string, duaRequestId?: string) {
    const result = await apiRequest('/likes', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, post_id: postId, dua_request_id: duaRequestId }),
    });
    return { data: result.data || { liked: false }, error: result.error };
  },

  async getComments(postId?: string, duaRequestId?: string) {
    const endpoint = postId ? `/comments/post/${postId}` : `/comments/dua/${duaRequestId}`;
    const result = await apiRequest(endpoint);
    return { data: result.data || [], error: result.error };
  },

  async createComment(comment: any) {
    return apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },

  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string) {
    return apiRequest('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, post_id: postId, dua_request_id: duaRequestId }),
    });
  },

  async getDuaRequests(limit = 20, offset = 0) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    const result = await apiRequest(`/dua-requests${queryString ? `?${queryString}` : ''}`);
    return { data: result.data || [], error: result.error };
  },

  async createDuaRequest(duaRequest: any) {
    return apiRequest('/dua-requests', {
      method: 'POST',
      body: JSON.stringify(duaRequest),
    });
  },

  async getCommunities() {
    const result = await apiRequest('/communities');
    return { data: result.data || [], error: result.error };
  },

  async createCommunity(community: any) {
    return apiRequest('/communities', {
      method: 'POST',
      body: JSON.stringify(community),
    });
  },

  async joinCommunity(communityId: string, userId: string) {
    return apiRequest(`/communities/${communityId}/join`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  async getEvents() {
    const result = await apiRequest('/events');
    return { data: result.data || [], error: result.error };
  },

  async createEvent(event: any) {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async attendEvent(eventId: string, userId: string) {
    return apiRequest(`/events/${eventId}/attend`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  async getUser(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  async updateUser(userId: string, updates: any) {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async incrementShareCount(postId: string) {
    // For compatibility - could be implemented later if needed
    return { data: null, error: null };
  }
};

export const isSupabaseConfigured = true;

// Mock supabase object for compatibility
export const supabase = {
  auth: {
    signUp: authHelpers.signUp,
    signInWithPassword: authHelpers.signIn,
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

// Database Types for backward compatibility
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          verified: boolean;
          role: 'user' | 'admin' | 'moderator';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          verified?: boolean;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type: 'text' | 'image' | 'video';
          media_url: string | null;
          category: string;
          tags: string[];
          likes_count: number;
          comments_count: number;
          shares_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          type?: 'text' | 'image' | 'video';
          media_url?: string | null;
          category?: string;
          tags?: string[];
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          type?: 'text' | 'image' | 'video';
          media_url?: string | null;
          category?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
      dua_requests: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          is_urgent?: boolean;
          is_anonymous?: boolean;
          tags?: string[];
          prayers_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          category?: string;
          is_urgent?: boolean;
          is_anonymous?: boolean;
          tags?: string[];
          updated_at?: string;
        };
      };
    };
  };
};