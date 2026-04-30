import jwt from "jsonwebtoken";
import sql from "../configs/db.js";

export const requireAuth = async (req, res, next) => {
  console.log("cookies received: ", req.cookies);
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {    
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh plan data from DB
    const [dbUser] = await sql`
      SELECT plan, expires_at 
      FROM users 
      WHERE id = ${payload.id}
    `;

    if (!dbUser) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      ...payload,
      plan: dbUser.plan,
      expires_at: dbUser.expires_at,
    };
    
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
