import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.optional(v.string()),
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

// Store user after Auth0 authentication
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Ensure we have required fields
    if (!identity.tokenIdentifier) {
      throw new ConvexError("Missing token identifier");
    }
    
    if (!identity.email) {
      throw new ConvexError("Email is required but not provided by Auth0. Please check your Auth0 configuration.");
    }

    // Check if user already exists by tokenIdentifier
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    // If not found by tokenIdentifier, check by email for migration
    if (!existingUser) {
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
      
      // If found by email, update with tokenIdentifier
      if (existingUser) {
        await ctx.db.patch(existingUser._id, {
          tokenIdentifier: identity.tokenIdentifier,
          name: identity.name || existingUser.name,
          email: identity.email,
          avatarUrl: identity.pictureUrl || existingUser.avatarUrl
        });
        return existingUser._id;
      }
    }
    
    if (existingUser) {
      // Update existing user with latest info
      await ctx.db.patch(existingUser._id, {
        name: identity.name || "Anonymous",
        email: identity.email,
        avatarUrl: identity.pictureUrl
      });
      return existingUser._id;
    }
    
    // Create new user
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name || "Anonymous",
      email: identity.email,
      is_premium: false,
      avatarUrl: identity.pictureUrl
    });
    
    return userId;
  }
});