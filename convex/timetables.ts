import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found");
    }

    const timetables = await ctx.db
      .query("timetables")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();

    return timetables;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    stopName: v.string(),
    stopId: v.string(),
    theme: v.union(v.literal("color"), v.literal("bw")),
    data: v.array(v.object({
      time: v.string(),
      busNumber: v.string(),
      destination: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found");
    }

    const existingTimetables = await ctx.db
      .query("timetables")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();

    if (existingTimetables.length >= 3) {
      throw new Error("Maximum of 3 timetables per project");
    }

    const timetableId = await ctx.db.insert("timetables", {
      ...args,
      createdAt: Date.now(),
    });

    return timetableId;
  },
});

export const update = mutation({
  args: {
    id: v.id("timetables"),
    stopName: v.optional(v.string()),
    stopId: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("color"), v.literal("bw"))),
    data: v.optional(v.array(v.object({
      time: v.string(),
      busNumber: v.string(),
      destination: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const timetable = await ctx.db.get(args.id);
    if (!timetable) {
      throw new Error("Timetable not found");
    }

    const project = await ctx.db.get(timetable.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("timetables") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const timetable = await ctx.db.get(args.id);
    if (!timetable) {
      throw new Error("Timetable not found");
    }

    const project = await ctx.db.get(timetable.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});