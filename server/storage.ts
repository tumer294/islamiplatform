import { eq, desc, and, or } from "drizzle-orm";
import { db } from "./db";
import { 
  users, posts, duaRequests, likes, comments, bookmarks, 
  communities, communityMembers, events, eventAttendees,
  type User, type InsertUser, type Post, type InsertPost,
  type DuaRequest, type InsertDuaRequest, type Community, type InsertCommunity,
  type Event, type InsertEvent
} from "@shared/schema";

// Generate random UUIDs for in-memory storage
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// In-memory storage implementation for Bolt.new compatibility
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private duaRequests: Map<string, DuaRequest> = new Map();
  private likes: Map<string, any> = new Map();
  private comments: Map<string, any> = new Map();
  private bookmarks: Map<string, any> = new Map();
  private communities: Map<string, Community> = new Map();
  private events: Map<string, Event> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: generateId(),
      email: user.email,
      name: user.name,
      username: user.username,
      avatar_url: user.avatar_url || null,
      bio: user.bio || null,
      location: user.location || null,
      website: user.website || null,
      verified: user.verified || false,
      role: user.role || 'user',
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updated_at: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getPosts(limit = 50): Promise<(Post & { users: User })[]> {
    const postsArray = Array.from(this.posts.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    
    return postsArray.map(post => ({
      ...post,
      users: this.users.get(post.user_id)!
    })).filter(post => post.users);
  }

  async getPost(id: string): Promise<(Post & { users: User }) | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const user = this.users.get(post.user_id);
    if (!user) return undefined;
    
    return { ...post, users: user };
  }

  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      id: generateId(),
      user_id: post.user_id,
      content: post.content,
      type: post.type || 'text',
      media_url: post.media_url || null,
      category: post.category || 'Genel',
      tags: post.tags || [],
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.posts.set(newPost.id, newPost);
    return newPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getDuaRequests(limit = 50): Promise<(DuaRequest & { users: User })[]> {
    const duaArray = Array.from(this.duaRequests.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    
    return duaArray.map(dua => ({
      ...dua,
      users: this.users.get(dua.user_id)!
    })).filter(dua => dua.users);
  }

  async createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest> {
    const newDua: DuaRequest = {
      id: generateId(),
      user_id: duaRequest.user_id,
      title: duaRequest.title,
      content: duaRequest.content,
      category: duaRequest.category,
      is_urgent: duaRequest.is_urgent || false,
      is_anonymous: duaRequest.is_anonymous || false,
      tags: duaRequest.tags || [],
      prayers_count: duaRequest.prayers_count || 0,
      comments_count: duaRequest.comments_count || 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.duaRequests.set(newDua.id, newDua);
    return newDua;
  }

  async toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ liked: boolean }> {
    const key = `${userId}-${postId || duaRequestId}`;
    const exists = this.likes.has(key);
    
    if (exists) {
      this.likes.delete(key);
      return { liked: false };
    } else {
      this.likes.set(key, { user_id: userId, post_id: postId, dua_request_id: duaRequestId });
      return { liked: true };
    }
  }

  async getUserLike(userId: string, postId?: string, duaRequestId?: string): Promise<boolean> {
    const key = `${userId}-${postId || duaRequestId}`;
    return this.likes.has(key);
  }

  async getCommentsByPostId(postId: string): Promise<any[]> {
    return Array.from(this.comments.values())
      .filter((comment: any) => comment.post_id === postId)
      .map((comment: any) => ({
        ...comment,
        users: this.users.get(comment.user_id)!
      }))
      .filter((comment: any) => comment.users);
  }

  async getCommentsByDuaRequestId(duaRequestId: string): Promise<any[]> {
    return Array.from(this.comments.values())
      .filter((comment: any) => comment.dua_request_id === duaRequestId)
      .map((comment: any) => ({
        ...comment,
        users: this.users.get(comment.user_id)!
      }))
      .filter((comment: any) => comment.users);
  }

  async createComment(comment: any): Promise<any> {
    const newComment = {
      id: generateId(),
      ...comment,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.comments.set(newComment.id, newComment);
    return newComment;
  }

  async getCommunities(): Promise<(Community & { users: User })[]> {
    return Array.from(this.communities.values()).map(community => ({
      ...community,
      users: this.users.get(community.created_by)!
    })).filter(community => community.users);
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    const newCommunity: Community = {
      id: generateId(),
      name: community.name,
      description: community.description,
      category: community.category,
      is_private: community.is_private || false,
      cover_image: community.cover_image || null,
      location: community.location || null,
      member_count: community.member_count || 0,
      created_by: community.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.communities.set(newCommunity.id, newCommunity);
    return newCommunity;
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    // Implementation for joining community
  }

  async getEvents(): Promise<(Event & { users: User })[]> {
    return Array.from(this.events.values()).map(event => ({
      ...event,
      users: this.users.get(event.created_by)!
    })).filter(event => event.users);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const newEvent: Event = {
      id: generateId(),
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date,
      time: event.time,
      location_name: event.location_name,
      location_address: event.location_address,
      location_city: event.location_city,
      organizer_name: event.organizer_name,
      organizer_contact: event.organizer_contact || null,
      capacity: event.capacity || 100,
      attendees_count: event.attendees_count || 0,
      price: event.price || '0',
      is_online: event.is_online || false,
      image_url: event.image_url || null,
      tags: event.tags || [],
      requirements: event.requirements || [],
      created_by: event.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.events.set(newEvent.id, newEvent);
    return newEvent;
  }

  async attendEvent(eventId: string, userId: string): Promise<void> {
    // Implementation for attending event
  }

  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ bookmarked: boolean }> {
    const key = `bookmark-${userId}-${postId || duaRequestId}`;
    const exists = this.bookmarks.has(key);
    
    if (exists) {
      this.bookmarks.delete(key);
      return { bookmarked: false };
    } else {
      this.bookmarks.set(key, { user_id: userId, post_id: postId, dua_request_id: duaRequestId });
      return { bookmarked: true };
    }
  }
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Posts
  getPosts(limit?: number): Promise<(Post & { users: User })[]>;
  getPost(id: string): Promise<(Post & { users: User }) | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: string): Promise<boolean>;
  
  // Dua Requests
  getDuaRequests(limit?: number): Promise<(DuaRequest & { users: User })[]>;
  createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest>;
  
  // Likes
  toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ liked: boolean }>;
  getUserLike(userId: string, postId?: string, duaRequestId?: string): Promise<boolean>;
  
  // Comments
  getCommentsByPostId(postId: string): Promise<(typeof comments.$inferSelect & { users: User })[]>;
  getCommentsByDuaRequestId(duaRequestId: string): Promise<(typeof comments.$inferSelect & { users: User })[]>;
  createComment(comment: Omit<typeof comments.$inferInsert, 'id' | 'created_at' | 'updated_at'>): Promise<typeof comments.$inferSelect>;
  
  // Communities
  getCommunities(): Promise<(Community & { users: User })[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  joinCommunity(communityId: string, userId: string): Promise<void>;
  
  // Events
  getEvents(): Promise<(Event & { users: User })[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  attendEvent(eventId: string, userId: string): Promise<void>;
  
  // Bookmarks
  toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ bookmarked: boolean }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getPosts(limit = 50): Promise<(Post & { users: User })[]> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.user_id, users.id))
      .orderBy(desc(posts.created_at))
      .limit(limit);
    
    return result.map(row => ({
      ...row.posts,
      users: row.users!
    }));
  }

  async getPost(id: string): Promise<(Post & { users: User }) | undefined> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.user_id, users.id))
      .where(eq(posts.id, id))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].posts,
      users: result[0].users!
    };
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async getDuaRequests(limit = 50): Promise<(DuaRequest & { users: User })[]> {
    const result = await db
      .select()
      .from(duaRequests)
      .leftJoin(users, eq(duaRequests.user_id, users.id))
      .orderBy(desc(duaRequests.created_at))
      .limit(limit);
    
    return result.map(row => ({
      ...row.dua_requests,
      users: row.users!
    }));
  }

  async createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest> {
    const result = await db.insert(duaRequests).values(duaRequest).returning();
    return result[0];
  }

  async toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ liked: boolean }> {
    const whereClause = and(
      eq(likes.user_id, userId),
      postId ? eq(likes.post_id, postId) : undefined,
      duaRequestId ? eq(likes.dua_request_id, duaRequestId) : undefined
    );

    const existing = await db.select().from(likes).where(whereClause).limit(1);
    
    if (existing.length > 0) {
      await db.delete(likes).where(whereClause);
      return { liked: false };
    } else {
      await db.insert(likes).values({
        user_id: userId,
        post_id: postId,
        dua_request_id: duaRequestId
      });
      return { liked: true };
    }
  }

  async getUserLike(userId: string, postId?: string, duaRequestId?: string): Promise<boolean> {
    const whereClause = and(
      eq(likes.user_id, userId),
      postId ? eq(likes.post_id, postId) : undefined,
      duaRequestId ? eq(likes.dua_request_id, duaRequestId) : undefined
    );

    const result = await db.select().from(likes).where(whereClause).limit(1);
    return result.length > 0;
  }

  async getCommentsByPostId(postId: string): Promise<(typeof comments.$inferSelect & { users: User })[]> {
    const result = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.user_id, users.id))
      .where(eq(comments.post_id, postId))
      .orderBy(desc(comments.created_at));
    
    return result.map(row => ({
      ...row.comments,
      users: row.users!
    }));
  }

  async getCommentsByDuaRequestId(duaRequestId: string): Promise<(typeof comments.$inferSelect & { users: User })[]> {
    const result = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.user_id, users.id))
      .where(eq(comments.dua_request_id, duaRequestId))
      .orderBy(desc(comments.created_at));
    
    return result.map(row => ({
      ...row.comments,
      users: row.users!
    }));
  }

  async createComment(comment: Omit<typeof comments.$inferInsert, 'id' | 'created_at' | 'updated_at'>): Promise<typeof comments.$inferSelect> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  async getCommunities(): Promise<(Community & { users: User })[]> {
    const result = await db
      .select()
      .from(communities)
      .leftJoin(users, eq(communities.created_by, users.id))
      .orderBy(desc(communities.created_at));
    
    return result.map(row => ({
      ...row.communities,
      users: row.users!
    }));
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    const result = await db.insert(communities).values(community).returning();
    return result[0];
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    await db.insert(communityMembers).values({
      community_id: communityId,
      user_id: userId,
      role: 'member'
    });
  }

  async getEvents(): Promise<(Event & { users: User })[]> {
    const result = await db
      .select()
      .from(events)
      .leftJoin(users, eq(events.created_by, users.id))
      .orderBy(desc(events.created_at));
    
    return result.map(row => ({
      ...row.events,
      users: row.users!
    }));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async attendEvent(eventId: string, userId: string): Promise<void> {
    await db.insert(eventAttendees).values({
      event_id: eventId,
      user_id: userId
    });
  }

  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ bookmarked: boolean }> {
    const whereClause = and(
      eq(bookmarks.user_id, userId),
      postId ? eq(bookmarks.post_id, postId) : undefined,
      duaRequestId ? eq(bookmarks.dua_request_id, duaRequestId) : undefined
    );

    const existing = await db.select().from(bookmarks).where(whereClause).limit(1);
    
    if (existing.length > 0) {
      await db.delete(bookmarks).where(whereClause);
      return { bookmarked: false };
    } else {
      await db.insert(bookmarks).values({
        user_id: userId,
        post_id: postId,
        dua_request_id: duaRequestId
      });
      return { bookmarked: true };
    }
  }
}

// Automatically choose storage implementation based on environment
export const storage: IStorage = db ? new DatabaseStorage() : new MemStorage();
