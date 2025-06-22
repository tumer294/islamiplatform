import { pgTable, text, uuid, integer, boolean, timestamp, numeric, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  verified: boolean("verified").default(false),
  role: text("role").default("user"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Posts table
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  type: text("type").default("text"),
  media_url: text("media_url"),
  category: text("category").default("Genel"),
  tags: text("tags").array().default([]),
  likes_count: integer("likes_count").default(0),
  comments_count: integer("comments_count").default(0),
  shares_count: integer("shares_count").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Dua requests table
export const duaRequests = pgTable("dua_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  is_urgent: boolean("is_urgent").default(false),
  is_anonymous: boolean("is_anonymous").default(false),
  tags: text("tags").array().default([]),
  prayers_count: integer("prayers_count").default(0),
  comments_count: integer("comments_count").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Likes table
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  dua_request_id: uuid("dua_request_id").references(() => duaRequests.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  dua_request_id: uuid("dua_request_id").references(() => duaRequests.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  is_prayer: boolean("is_prayer").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  post_id: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  dua_request_id: uuid("dua_request_id").references(() => duaRequests.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Communities table
export const communities = pgTable("communities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  is_private: boolean("is_private").default(false),
  cover_image: text("cover_image"),
  location: text("location"),
  member_count: integer("member_count").default(1),
  created_by: uuid("created_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Community members table
export const communityMembers = pgTable("community_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  community_id: uuid("community_id").references(() => communities.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").default("member"),
  joined_at: timestamp("joined_at", { withTimezone: true }).defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  location_name: text("location_name").notNull(),
  location_address: text("location_address").notNull(),
  location_city: text("location_city").notNull(),
  organizer_name: text("organizer_name").notNull(),
  organizer_contact: text("organizer_contact"),
  capacity: integer("capacity").default(100),
  attendees_count: integer("attendees_count").default(0),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  is_online: boolean("is_online").default(false),
  image_url: text("image_url"),
  tags: text("tags").array().default([]),
  requirements: text("requirements").array().default([]),
  created_by: uuid("created_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Event attendees table
export const eventAttendees = pgTable("event_attendees", {
  id: uuid("id").primaryKey().defaultRandom(),
  event_id: uuid("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  registered_at: timestamp("registered_at", { withTimezone: true }).defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  created_at: true,
  updated_at: true,
  likes_count: true,
  comments_count: true,
  shares_count: true,
});

export const insertDuaRequestSchema = createInsertSchema(duaRequests).omit({
  id: true,
  created_at: true,
  updated_at: true,
  prayers_count: true,
  comments_count: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  created_at: true,
  updated_at: true,
  member_count: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  created_at: true,
  updated_at: true,
  attendees_count: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type DuaRequest = typeof duaRequests.$inferSelect;
export type InsertDuaRequest = z.infer<typeof insertDuaRequestSchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
