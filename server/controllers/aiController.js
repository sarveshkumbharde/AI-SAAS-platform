// controllers/aiController.js
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import fs from 'fs';
import cloudinary from 'cloudinary';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { cache } from '../utils/cache.js';

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    // Create cache key (shorter and more efficient)
    const cacheKey = `article:${userId}:${Buffer.from(prompt).toString('base64').slice(0, 30)}`;

    // Check cache first
    const cachedArticle = await cache.get(cacheKey);
    if (cachedArticle) {
      console.log('✅ Serving article from cache');
      return res.json({ 
        success: true, 
        content: cachedArticle,
        cached: true 
      });
    }

    // If not cached, call Gemini API
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });
    const content = response.choices[0].message.content;

    // Save to database
    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    // Cache the result for 24 hours (articles don't change)
    await cache.set(cacheKey, content, 24 * 60 * 60);

    // Clear user creations cache (since we added new content)
    await cache.del(`user_creations:${userId}`);

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content, cached: false });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    // Cache key for blog titles
    const cacheKey = `blog_title:${userId}:${Buffer.from(prompt).toString('base64').slice(0, 30)}`;

    // Check cache
    const cachedTitle = await cache.get(cacheKey);
    if (cachedTitle) {
      console.log('✅ Serving blog title from cache');
      return res.json({ 
        success: true, 
        content: cachedTitle,
        cached: true 
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    // Cache for 24 hours
    await cache.set(cacheKey, content, 24 * 60 * 60);

    // Clear user creations cache
    await cache.del(`user_creations:${userId}`);

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content, cached: false });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const resume = req.file;
    const plan = req.plan;

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed file size (5MB)."
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    // Create cache key based on resume content hash
    const resumeHash = Buffer.from(pdfData.text).toString('base64').slice(0, 30);
    const cacheKey = `resume_review:${userId}:${resumeHash}`;

    // Check cache
    const cachedReview = await cache.get(cacheKey);
    if (cachedReview) {
      console.log('✅ Serving resume review from cache');
      return res.json({ 
        success: true, 
        content: cachedReview,
        cached: true 
      });
    }

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, areas for improvements. Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    // Cache for 24 hours
    await cache.set(cacheKey, content, 24 * 60 * 60);

    // Clear user creations cache
    await cache.del(`user_creations:${userId}`);

    res.json({ success: true, content, cached: false });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Image functions - cache Cloudinary URLs
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // Cache key for image generation
    const cacheKey = `generated_image:${userId}:${Buffer.from(prompt).toString('base64').slice(0, 30)}`;

    // Check cache
    const cachedImage = await cache.get(cacheKey);
    if (cachedImage) {
      console.log('✅ Serving generated image from cache');
      return res.json({ 
        success: true, 
        content: cachedImage,
        cached: true 
      });
    }

    const formData = new FormData()
    formData.append('prompt', prompt)
    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY
      },
      responseType: "arraybuffer"
    })

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
    VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    // Cache image URL for 1 hour
    await cache.set(cacheKey, secure_url, 60 * 60);

    // Clear relevant caches
    await cache.del(`user_creations:${userId}`);
    if (publish) {
      await cache.del('published_creations');
    }

    res.json({ success: true, content: secure_url, cached: false });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add these utility functions for image caching
import crypto from 'crypto';

// Helper to create cache key from file
const createImageCacheKey = (userId, file, additionalData = '') => {
  const fileHash = crypto.createHash('md5')
    .update(fs.readFileSync(file.path))
    .digest('hex')
    .slice(0, 16);
  
  const dataHash = crypto.createHash('md5')
    .update(additionalData)
    .digest('hex')
    .slice(0, 8);
  
  return `image_processing:${userId}:${fileHash}:${dataHash}`;
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const image = req.file;
    const plan = req.plan;

    // Create cache key based on file content
    const cacheKey = createImageCacheKey(userId, image, 'background_removal');

    // Check cache
    const cachedImage = await cache.get(cacheKey);
    if (cachedImage) {
      console.log('✅ Serving background removal from cache');
      return res.json({ 
        success: true, 
        content: cachedImage,
        cached: true 
      });
    }

    // Upload with background removal
    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          background_removal: "cloudinary_ai"
        }
      ]
    });

    // Save to database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background image', ${secure_url}, 'image')
    `;

    // Cache for 1 hour (images don't change)
    await cache.set(cacheKey, secure_url, 60 * 60);

    // Clear user creations cache
    await cache.del(`user_creations:${userId}`);

    res.json({ 
      success: true, 
      content: secure_url,
      cached: false 
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const image = req.file;
    const { object } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium user",
      });
    }

    // Create cache key based on file content AND object to remove
    const cacheKey = createImageCacheKey(userId, image, `object_removal:${object}`);

    // Check cache
    const cachedImage = await cache.get(cacheKey);
    if (cachedImage) {
      console.log('✅ Serving object removal from cache');
      return res.json({ 
        success: true, 
        content: cachedImage,
        cached: true 
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const image_url = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove: ${object}` }],
      resource_type: 'image'
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${`Remove ${object} from image`}, ${image_url}, 'image')`;

    // Cache for 1 hour
    await cache.set(cacheKey, image_url, 60 * 60);

    // Clear user creations cache
    await cache.del(`user_creations:${userId}`);

    res.json({ 
      success: true, 
      content: image_url,
      cached: false 
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};