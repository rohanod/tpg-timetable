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
    
    // First try to find by tokenIdentifier
    let user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    // If not found and we have an email, try to find by email (for migration)
    if (!user && identity.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email))
        .first();
      
      // If found by email but missing tokenIdentifier, update it
      if (user && !user.tokenIdentifier) {
        await ctx.db.patch(user._id, {
          tokenIdentifier: identity.tokenIdentifier
        });
        // Refetch the updated user
        user = await ctx.db.get(user._id);
      }
    }
      
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

    // Check if user already exists by tokenIdentifier
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    // If not found by tokenIdentifier but we have email, check by email
    if (!existingUser && identity.email) {
      existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email))
        .first();
      
      // If found by email, update with tokenIdentifier
      if (existingUser) {
        await ctx.db.patch(existingUser._id, {
          tokenIdentifier: identity.tokenIdentifier,
          name: identity.name || existingUser.name,
          avatarUrl: identity.pictureUrl || existingUser.avatarUrl
        });
        return existingUser._id;
      }
    }
    
    if (existingUser) {
      // Update existing user with latest info
      await ctx.db.patch(existingUser._id, {
        tokenIdentifier: identity.tokenIdentifier,
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