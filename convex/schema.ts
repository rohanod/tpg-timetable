import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  }),
  
  timetables: defineTable({
    projectId: v.id("projects"),
    stopName: v.string(),
    stopId: v.string(),
    theme: v.union(v.literal("color"), v.literal("bw")),
    data: v.array(v.object({
      time: v.string(),
      busNumber: v.string(),
      destination: v.string(),
    })),
    createdAt: v.number(),
  }),
});