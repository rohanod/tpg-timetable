import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    is_premium: v.optional(v.boolean()),
    avatarUrl: v.optional(v.string())
  })
  .index("by_token_identifier", ["tokenIdentifier"])
  .index("by_email", ["email"]),
  
  projects: defineTable({
    name: v.string(),
    user_id: v.id("users"),
    created_at: v.number()
  }).index("by_user", ["user_id"]),
  
  timetables: defineTable({
    project_id: v.id("projects"),
    stopName: v.string(),
    stopId: v.string(),
    theme: v.string(),
    data: v.any(), // For the schedule data
    created_at: v.number()
  })
  .index("by_project", ["project_id"])
});