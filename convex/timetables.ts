import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all timetables for a project
export const getTimetables = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Verify the project belongs to the user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.user_id !== user._id) {
      throw new ConvexError("Project not found or not authorized");
    }
    
    const timetables = await ctx.db
      .query("timetables")
      .withIndex("by_project", (q) => q.eq("project_id", project._id))
      .collect();
    
    return timetables.map(timetable => ({
      ...timetable,
      created_at: new Date(timetable.created_at).toISOString()
    }));
  }
});

// Add a new timetable to a project
export const addTimetable = mutation({
  args: {
    projectId: v.id("projects"),
    timetable: v.object({
      stopName: v.string(),
      stopId: v.string(),
      theme: v.string(),
      data: v.any()
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Verify the project belongs to the user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.user_id !== user._id) {
      throw new ConvexError("Project not found or not authorized");
    }
    
    // Check timetable limit (free users can only have 3 timetables per project)
    const existingTimetables = await ctx.db
      .query("timetables")
      .withIndex("by_project", (q) => q.eq("project_id", project._id))
      .collect();
    
    if (existingTimetables.length >= 3 && !user.is_premium) {
      throw new ConvexError("You can only create three timetables per project");
    }
    
    const timetableId = await ctx.db.insert("timetables", {
      project_id: project._id,
      stopName: args.timetable.stopName,
      stopId: args.timetable.stopId,
      theme: args.timetable.theme,
      data: args.timetable.data || [],
      created_at: Date.now()
    });
    
    return {
      id: timetableId,
      ...args.timetable,
      created_at: new Date().toISOString()
    };
  }
});

// Update a timetable
export const updateTimetable = mutation({
  args: {
    timetableId: v.id("timetables"),
    updates: v.object({
      stopName: v.optional(v.string()),
      stopId: v.optional(v.string()),
      theme: v.optional(v.string()),
      data: v.optional(v.any())
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const timetable = await ctx.db.get(args.timetableId);
    if (!timetable) {
      throw new ConvexError("Timetable not found");
    }
    
    // Verify the user has access to this timetable via the project
    const project = await ctx.db.get(timetable.project_id);
    if (!project) {
      throw new ConvexError("Project not found");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    if (!user || project.user_id !== user._id) {
      throw new ConvexError("Not authorized");
    }
    
    await ctx.db.patch(args.timetableId, args.updates);
  }
});

// Delete a timetable
export const deleteTimetable = mutation({
  args: { timetableId: v.id("timetables") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const timetable = await ctx.db.get(args.timetableId);
    if (!timetable) {
      throw new ConvexError("Timetable not found");
    }
    
    // Verify the user has access to this timetable via the project
    const project = await ctx.db.get(timetable.project_id);
    if (!project) {
      throw new ConvexError("Project not found");
    }
    
    // First try by tokenIdentifier
    let user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    // Fallback to email lookup for migration
    if (!user && identity.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email))
        .first();
    }
    
    if (!user || project.user_id !== user._id) {
      throw new ConvexError("Not authorized");
    }
    
    await ctx.db.delete(args.timetableId);
  }
});