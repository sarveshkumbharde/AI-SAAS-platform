import Stripe from "stripe";
import sql from "../configs/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // yearly premium
          quantity: 1,
        }, 
      ],
      metadata: {
        userId: String(userId),
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/plan`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ message: "Unable to create checkout session" });
  }
};


export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, // MUST be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle only what you need
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // We stored userId in metadata when creating checkout
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("❌ Missing userId in Stripe metadata");
      return res.status(400).json({ message: "Missing userId" });
    }

    // Grant 1-year premium access
    await sql`
      UPDATE users
      SET plan = 'premium',
          expires_at = now() + interval '1 year'
      WHERE id = ${userId}
    `;

    console.log(`✅ User ${userId} upgraded to premium (1 year)`);
  }

  // Always acknowledge receipt
  res.json({ received: true });
};
