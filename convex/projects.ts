import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all projects for the current user
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();
    
    return projects.map(project => ({
      ...project,
      created_at: new Date(project.created_at).toISOString()
    }));
  }
});

// Get a specific project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    const project = await ctx.db.get(args.projectId);
    
    if (!project || project.user_id !== user._id) {
      throw new ConvexError("Project not found");
    }
    
    return {
      ...project,
      created_at: new Date(project.created_at).toISOString()
    };
  }
});

// Create a new project
export const createProject = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check if user already has a project (free tier limit)
    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();
      
    if (existingProjects.length >= 1 && !user.is_premium) {
      throw new ConvexError("Free accounts can only create one project. Please delete an existing project first.");
    }
    
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      user_id: user._id,
      created_at: Date.now()
    });
    
    return {
      _id: projectId,
      name: args.name,
      user_id: user._id,
      created_at: new Date().toISOString()
    };
  }
});

// Delete a project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    const project = await ctx.db.get(args.projectId);
    
    if (!project || project.user_id !== user._id) {
      throw new ConvexError("Project not found or not authorized");
    }
    
    // Delete all timetables associated with this project
    const timetables = await ctx.db
      .query("timetables")
      .withIndex("by_project", (q) => q.eq("project_id", project._id))
      .collect();
    
    for (const timetable of timetables) {
      await ctx.db.delete(timetable._id);
    }
    
    // Delete the project itself
    await ctx.db.delete(project._id);
  }
});

export const getUserPermissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    return { data: {
      id: user._id,
      is_premium: user.is_premium,
      created_at: new Date(user._creationTime).toISOString()
    }};
  }
});