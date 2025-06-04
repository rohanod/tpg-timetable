import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTimetables = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timetables")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const createTimetable = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("timetables", {
      projectId: args.projectId,
      stopName: args.stopName,
      stopId: args.stopId,
      theme: args.theme,
      data: args.data,
    });
  },
});

export const updateTimetable = mutation({
  args: {
    id: v.id("timetables"),
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      stopName: args.stopName,
      stopId: args.stopId,
      theme: args.theme,
      data: args.data,
    });
  },
});

export const deleteTimetable = mutation({
  args: {
    id: v.id("timetables"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});