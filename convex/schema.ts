import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    is_premium: v.boolean(),
    full_name: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
  }),

  projects: defineTable({
    name: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  timetables: defineTable({
    projectId: v.id("projects"),
    stopName: v.string(),
    stopId: v.string(),
    theme: v.string(),
    data: v.array(
      v.object({
        time: v.string(),
        busNumber: v.string(),
        destination: v.string(),
      })
    ),
  }).index("by_project", ["projectId"]),
});