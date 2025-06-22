import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertDuaRequestSchema, insertCommunitySchema, insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ user, error: null });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ user: null, error: "Failed to create user" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (user) {
        res.json({ user, error: null });
      } else {
        res.status(401).json({ user: null, error: "User not found" });
      }
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ user: null, error: "Authentication failed" });
    }
  });

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(400).json({ error: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePost(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Post not found" });
      }
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Dua requests routes
  app.get("/api/dua-requests", async (req, res) => {
    try {
      const duaRequests = await storage.getDuaRequests();
      res.json(duaRequests);
    } catch (error) {
      console.error("Get dua requests error:", error);
      res.status(500).json({ error: "Failed to fetch dua requests" });
    }
  });

  app.post("/api/dua-requests", async (req, res) => {
    try {
      const duaData = insertDuaRequestSchema.parse(req.body);
      const duaRequest = await storage.createDuaRequest(duaData);
      res.json(duaRequest);
    } catch (error) {
      console.error("Create dua request error:", error);
      res.status(400).json({ error: "Failed to create dua request" });
    }
  });

  // Likes routes
  app.post("/api/likes", async (req, res) => {
    try {
      const { user_id, post_id, dua_request_id } = req.body;
      const result = await storage.toggleLike(user_id, post_id, dua_request_id);
      res.json(result);
    } catch (error) {
      console.error("Toggle like error:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  app.get("/api/likes/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { post_id, dua_request_id } = req.query;
      const liked = await storage.getUserLike(userId, post_id as string, dua_request_id as string);
      res.json({ liked });
    } catch (error) {
      console.error("Get user like error:", error);
      res.status(500).json({ error: "Failed to get like status" });
    }
  });

  // Comments routes
  app.get("/api/comments/post/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error("Get post comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.get("/api/comments/dua/:duaId", async (req, res) => {
    try {
      const { duaId } = req.params;
      const comments = await storage.getCommentsByDuaRequestId(duaId);
      res.json(comments);
    } catch (error) {
      console.error("Get dua comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const comment = await storage.createComment(req.body);
      res.json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(400).json({ error: "Failed to create comment" });
    }
  });

  // Communities routes
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Get communities error:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  app.post("/api/communities", async (req, res) => {
    try {
      const communityData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(communityData);
      res.json(community);
    } catch (error) {
      console.error("Create community error:", error);
      res.status(400).json({ error: "Failed to create community" });
    }
  });

  app.post("/api/communities/:id/join", async (req, res) => {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      await storage.joinCommunity(id, user_id);
      res.json({ success: true });
    } catch (error) {
      console.error("Join community error:", error);
      res.status(400).json({ error: "Failed to join community" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(400).json({ error: "Failed to create event" });
    }
  });

  app.post("/api/events/:id/attend", async (req, res) => {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      await storage.attendEvent(id, user_id);
      res.json({ success: true });
    } catch (error) {
      console.error("Attend event error:", error);
      res.status(400).json({ error: "Failed to attend event" });
    }
  });

  // Bookmarks routes
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const { user_id, post_id, dua_request_id } = req.body;
      const result = await storage.toggleBookmark(user_id, post_id, dua_request_id);
      res.json(result);
    } catch (error) {
      console.error("Toggle bookmark error:", error);
      res.status(500).json({ error: "Failed to toggle bookmark" });
    }
  });

  // Users routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
