import express from 'express';
import { stripeWebhook, createCheckoutSession } from "../controllers/billingController.js";
import { requireAuth } from "../middlewares/auth.js";


const router = express.Router();


router.post("/create-checkout-session", requireAuth, createCheckoutSession)

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;

// normal APIs → express.json()

// webhook route → express.raw({ type: "application/json" }) 