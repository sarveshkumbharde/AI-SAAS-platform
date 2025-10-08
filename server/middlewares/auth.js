import { clerkClient } from "@clerk/express";


async function has(userId, { plan }) {
  const user = await clerkClient.users.getUser(userId);
  return user.privateMetadata?.plan === plan;
}

export const auth = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const hasPremiumPlan = await has(userId, { plan: "premium" });
    const user = await clerkClient.users.getUser(userId);

    if (hasPremiumPlan) {
      // Premium users don’t use free_usage at all
      req.plan = "premium";
      req.free_usage = null; // or just ignore
    } else {
      // Free plan logic
      const freeUsage = user.privateMetadata?.free_usage || 0;

      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: freeUsage, // keep current count
        },
      });

      req.plan = "free";
      req.free_usage = freeUsage;
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
