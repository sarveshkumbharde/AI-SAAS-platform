// controllers/userController.js
import sql from "../configs/db.js";
import { cache } from '../utils/cache.js';

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth;
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
        const {userId} = req.auth;
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