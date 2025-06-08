import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

// Get the current user from Auth0 identity
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Look up user by Auth0 subject ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
      
    return user;
  }
});

// Store user after Auth0 authentication
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    if (existingUser) {
      // Update existing user with latest info
      await ctx.db.patch(existingUser._id, {
        name: identity.name || "Anonymous",
        email: identity.email || "",
        avatarUrl: identity.pictureUrl
      });
      return existingUser._id;
    }
    
    // Create new user
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name || "Anonymous",
      email: identity.email || "",
      is_premium: false,
      avatarUrl: identity.pictureUrl
    });
    
    return userId;
  }
});

// Get user permissions/profile
export const getUserPermissions = query({
  args: {},
  handler: async (ctx) => {
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
    
    return {
      data: {
        id: user._id,
        is_premium: user.is_premium,
        created_at: new Date(user._creationTime).toISOString(),
        email: user.email,
        name: user.name
      }
    };
  }
});