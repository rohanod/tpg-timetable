import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get the current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Ensure email exists before using it for lookup
    if (!identity.email) {
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();
      
    return user;
  }
});

// Store the current user
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Ensure email exists
    if (!identity.email) {
      throw new ConvexError("User email is missing");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();
    
    if (user) {
      // Update the existing user if needed
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { 
          name: identity.name || "Anonymous" 
        });
      }
      return user._id;
    }
    
    // Create a new user
    return await ctx.db.insert("users", {
      name: identity.name || "Anonymous",
      email: identity.email,
      is_premium: false,
      avatarUrl: identity.pictureUrl
    });
  }
});