import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRouter.js';
import billingRoutes from "./routes/billingRoutes.js";
import { generalLimiter } from './middlewares/rateLimiters/index.js';

dotenv.config();
const app = express();

connectCloudinary();
app.use(cors({
    origin: "http://localhost:5174",
    credentials: true
}));

app.use(cookieParser())

app.use("/billing", billingRoutes);   //It should appear before express.json() middleware

app.use(express.json());

// Apply general limiter to ALL authenticated routes
app.use('/api/user', generalLimiter, userRouter);
app.use('/api/ai', generalLimiter, aiRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
});