import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return projects;
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found");
    }

    return project;
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existingProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    if (existingProjects.length >= 1) {
      throw new Error("Free accounts can only create one project");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      userId: identity.subject,
      createdAt: Date.now(),
    });

    return projectId;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found");
    }

    // Delete associated timetables
    const timetables = await ctx.db
      .query("timetables")
      .filter((q) => q.eq(q.field("projectId"), args.id))
      .collect();

    for (const timetable of timetables) {
      await ctx.db.delete(timetable._id);
    }

    await ctx.db.delete(args.id);
  },
});