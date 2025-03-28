// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  console.error('NEXT_PUBLIC_BASE_URL environment variable is not set');
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with the secret key
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia', // Use the latest API version
}) : null;

/**
 * Constants for product prices
 * Note: These should be moved to environment variables in production
 */
export const PRICES = {
  HEADSHOT_GENERATION: process.env.STRIPE_PRICE_ID || 'price_1R7chHK9ng7JDxkssJ8d6c7z', // Basic tier price ID
};

/**
 * Create a Stripe checkout session for headshot generation
 * @param userId The ID of the user
 * @param headshotId The ID of the headshot
 * @returns The checkout session URL
 */
export async function createCheckoutSession(userId: string, headshotId: string): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not initialized. Please check STRIPE_SECRET_KEY environment variable.');
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICES.HEADSHOT_GENERATION,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&headshot=${headshotId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
      metadata: {
        userId,
        headshotId,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return session.url;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    if (error instanceof Error) {
      if (error.message.includes('price')) {
        throw new Error('Invalid price ID. Please check STRIPE_PRICE_ID environment variable.');
      }
      if (error.message.includes('authentication')) {
        throw new Error('Stripe authentication failed. Please check STRIPE_SECRET_KEY.');
      }
    }
    throw new Error('Failed to create checkout session: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Verify a payment from Stripe webhook
 * @param sessionId The ID of the Stripe checkout session
 * @returns The metadata from the session
 */
export async function verifyPayment(sessionId: string): Promise<{
  userId: string;
  headshotId: string;
  paid: boolean;
}> {
  if (!stripe) {
    throw new Error('Stripe is not initialized. Please check STRIPE_SECRET_KEY environment variable.');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return {
        userId: session.metadata?.userId || '',
        headshotId: session.metadata?.headshotId || '',
        paid: false,
      };
    }

    if (!session.metadata?.userId || !session.metadata?.headshotId) {
      throw new Error('Missing metadata in Stripe session');
    }

    return {
      userId: session.metadata.userId,
      headshotId: session.metadata.headshotId,
      paid: true,
    };
  } catch (error) {
    console.error('Error verifying payment with Stripe:', error);
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        throw new Error('Stripe authentication failed. Please check STRIPE_SECRET_KEY.');
      }
      if (error.message.includes('session')) {
        throw new Error('Invalid session ID or session not found.');
      }
    }
    throw new Error('Failed to verify payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export default stripe;