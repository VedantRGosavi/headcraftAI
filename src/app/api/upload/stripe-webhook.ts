// pages/api/stripe-webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { verifyPayment } from '../../../lib/stripe';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      return res.status(400).json({
        error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Verify the payment and get user/headshot IDs
      const { userId, headshotId, paid } = await verifyPayment(session.id);

      if (paid) {
        // Start the headshot generation process
        // In a production app, you would queue this for background processing
        // For this demo, we'll assume the payment triggers the generation
        // The actual generation is handled in the /api/generate.ts endpoint

        // Notify the client that the payment was successful
        console.log(`Payment successful for headshot ${headshotId}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error in Stripe webhook handler:', error);
    return res.status(500).json({
      error: 'Failed to process Stripe webhook',
    });
  }
}