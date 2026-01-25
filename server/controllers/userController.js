import sql from "../configs/db.js";
import { cache } from '../utils/cache.js';
import jwt from "jsonwebtoken";
import qs from 'qs'
import axios from 'axios'

export const startGoogleOAuth = async(req, res)=>{
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "consent",
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}

export const handleGoogleOAuthCallback = async (req, res) => {
  console.log("OAuth callback hit");

  try {
    const { code } = req.query;
    console.log("OAuth code received:", !!code);

    console.log("OAuth: before token exchange");

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000, // 🔥 IMPORTANT
      }
    );

    console.log("OAuth: after token exchange");

    const { id_token } = tokenRes.data;
    const decoded = jwt.decode(id_token);
    const { sub, email } = decoded;

    console.log("OAuth: before DB lookup");

    let [user] = await sql`
      SELECT * FROM users
      WHERE provider = 'google' AND provider_id = ${sub}
    `;

    console.log("OAuth: after DB lookup");

    if (!user) {
      console.log("OAuth: creating user");
      [user] = await sql`
        INSERT INTO users (email, provider, provider_id)
        VALUES (${email}, 'google', ${sub})
        RETURNING *
      `;
    }

    console.log("OAuth: before JWT sign");

    const appToken = jwt.sign(
      {
        id: user.id,
        plan: user.plan,
        expires_at: user.expires_at,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    console.log("OAuth: redirecting to frontend");

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${appToken}`
    );
  } catch (err) {
    console.error("OAuth error:", err.message);
    res.status(500).json({ message: "OAuth failed" });
  }
};

export const getUser = async(req, res) => {
  const [user] = await sql`
    SELECT id, plan, expires_at
    FROM users
    WHERE id = ${req.user.id}
  `;
  res.json(user);
}


export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.user;
    const cacheKey = `user_creations:${userId}`;
    
    // Check cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log('✅ Serving user creations from cache');
      return res.json({ 
        success: true, 
        creations: cachedData,
        cached: true 
      });
    }

    // If not cached, query database
    const creations = await sql`
      SELECT * FROM creations WHERE user_id=${userId} ORDER BY created_at DESC
    `;

    // Cache for 5 minutes (frequently updated data)
    await cache.set(cacheKey, creations, 5 * 60);

    res.json({ 
      success: true, 
      creations,
      cached: false 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async(req,res)=>{
    try {
        const cacheKey = 'published_creations';
        
        // Check cache
        const cachedData = await cache.get(cacheKey);
        if (cachedData) {
          console.log('✅ Serving published creations from cache');
          return res.json({ 
            success: true, 
            creations: cachedData,
            cached: true 
          });
        }

        const creations = await sql`SELECT * FROM creations WHERE publish=true ORDER BY created_at DESC`;
        
        // Cache for 2 minutes (community page data)
        await cache.set(cacheKey, creations, 2 * 60);
        
        res.json({
          success:true, 
          creations,
          cached: false
        });
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

export const toggleLikeCreation = async(req,res)=>{
    try {
        const {userId} = req.user;
        const {id} = req.body;
        
        const [creation] = await sql`SELECT * FROM creations WHERE id=${id}`

        if(!creation) return res.json({success:false, message:"Creation not found"});

        const currentLikes = creation.likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=>user!==userIdStr);
            message = 'Creation unliked';
        }
        else{
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation liked';
        }

        const formattedArray = `{${updatedLikes.join(',')}}`;

        await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id=${id}`;

        // Clear relevant caches when likes change
        await cache.del(`user_creations:${userId}`);

        res.json({success:true, message})
    } catch (error) {
        res.json({success:false, message: error.message});
    }
}