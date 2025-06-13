import { defineSchema, defineTable } from "convex/server";
import { v, ConvexError } from "convex/values"; 
import { mutation, query } from "./_generated/server";

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

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
      
    return user;
  }
});

// Get user permissions
export const getUserPermissions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx, {});
    if (!user) {
      return { data: null };
    }
    
    return { 
      data: {
        id: user._id,
        is_premium: user.is_premium || false,
        created_at: user._creationTime
      }
    };
  }
});