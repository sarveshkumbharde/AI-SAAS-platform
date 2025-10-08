import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRouter.js';


dotenv.config();
const app = express();

connectCloudinary();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


app.get('/',(req,res)=>console.log('server is live'))

app.use(requireAuth());
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})