// import { clerkClient } from "@clerk/express";


// async function has(userId, { plan }) {
//   const user = await clerkClient.users.getUser(userId);
//   return user.privateMetadata?.plan === plan;
// }

// export const auth = async (req, res, next) => {
//   try {
//     const { userId } = req.auth;

//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const hasPremiumPlan = await has(userId, { plan: "premium" });
//     const user = await clerkClient.users.getUser(userId);

//     if (hasPremiumPlan) {
//       // Premium users don’t use free_usage at all
//       req.plan = "premium";
//       req.free_usage = null; // or just ignore
//     } else {
//       // Free plan logic
//       const freeUsage = user.privateMetadata?.free_usage || 0;

//       await clerkClient.users.updateUserMetadata(userId, {
//         privateMetadata: {
//           free_usage: freeUsage, // keep current count
//         },
//       });

//       req.plan = "free";
//       req.free_usage = freeUsage;
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// middlewares/auth.js
import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; 
    // { id, plan, expires_at }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
