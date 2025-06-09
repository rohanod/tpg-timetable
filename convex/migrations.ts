import { internalMutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// Migration to add tokenIdentifier to existing users
export const migrateUsersToTokenIdentifier = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all users without tokenIdentifier
    const users = await ctx.db.query("users").collect();
    
    let migratedCount = 0;
    
    for (const user of users) {
      // Check if user already has tokenIdentifier
      if (!user.tokenIdentifier && user.email) {
        // For existing users, we'll create a temporary tokenIdentifier based on email
        // This is a fallback - in production, you'd want to handle this more carefully
        const tempTokenIdentifier = `email|${user.email}`;
        
        try {
          await ctx.db.patch(user._id, {
            tokenIdentifier: tempTokenIdentifier
          });
          migratedCount++;
        } catch (error) {
          console.error(`Failed to migrate user ${user._id}:`, error);
        }
      }
    }
    
    return { migratedCount, totalUsers: users.length };
  }
});

// Clean up duplicate users (optional)
export const cleanupDuplicateUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const emailMap = new Map<string, typeof users[0]>();
    const duplicates: typeof users = [];
    
    // Find duplicates by email
    for (const user of users) {
      if (user.email) {
        const existing = emailMap.get(user.email);
        if (existing) {
          // Keep the newer user (higher _creationTime)
          if (user._creationTime > existing._creationTime) {
            duplicates.push(existing);
            emailMap.set(user.email, user);
          } else {
            duplicates.push(user);
          }
        } else {
          emailMap.set(user.email, user);
        }
      }
    }
    
    // Delete duplicates
    for (const duplicate of duplicates) {
      await ctx.db.delete(duplicate._id);
    }
    
    return { deletedCount: duplicates.length };
  }
});