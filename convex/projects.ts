import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getProjects = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name,
      userId: args.userId,
    });
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Delete all timetables first
    const timetables = await ctx.db
      .query("timetables")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    for (const timetable of timetables) {
      await ctx.db.delete(timetable._id);
    }
    
    // Then delete the project
    await ctx.db.delete(args.projectId);
  },
});