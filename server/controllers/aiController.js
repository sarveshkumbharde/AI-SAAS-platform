import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import fs from 'fs';
import cloudinary from 'cloudinary';
import pdf from 'pdf-parse/lib/pdf-parse.js'

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

    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
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
    console.log(JSON.stringify(response, null, 2));

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // if (plan !== "premium") {
    //   return res.json({
    //     success: false,
    //     message: "This feature is only available to premium user",
    //   });
    // }

    const formData = new FormData()
    formData.append('prompt', prompt)
    const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY
      },
      responseType: "arraybuffer"
    })

    const base64Image = `data:image/png;base64,${Buffer.from (data, 'binary').toString('base64')}`;

    const {secure_url} = await cloudinary.uploader.upload(base64Image);


    await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
    VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const image = req.file;
    const plan = req.plan;

    // Premium check (uncomment if needed)
    // if (plan !== "premium") {
    //   return res.json({
    //     success: false,
    //     message: "This feature is only available to premium users",
    //   });
    // }

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

    res.json({ success: true, content: secure_url });
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
    const {object} = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium user",
      });
    }

    const {public_id} = await cloudinary.uploader.upload(image.path);

    const image_url = cloudinary.url(public_id, {
      transformation:[{effect:`gen_remove: ${object}`}],
      resource_type: 'image'
    })


    await sql`INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${`Remove ${object} from image`}, ${image_url}, 'image')`;

    res.json({ success: true, content: image_url });
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

    // if (plan !== "premium") {
    //   return res.json({
    //     success: false,
    //     message: "This feature is only available to premium user",
    //   });
    // }

    if(resume.size > 5*1024*1024){
      return res.json({
        success:false,
        message:"Resume file size exceeds allowed file size (5MB)."
      })
    }
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, areas for improvements. Resume Content:\n\n${pdfData.text}`

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

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};