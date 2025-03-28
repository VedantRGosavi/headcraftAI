// lib/stripe.ts
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

// Initialize Stripe with the secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia', // Use the latest API version
});

/**
 * Constants for product prices
 */
export const PRICES = {
  HEADSHOT_GENERATION: 'price_1R7chHK9ng7JDxkssJ8d6c7z', // Basic tier price ID
};

/**
 * Create a Stripe checkout session for headshot generation
 * @param userId The ID of the user
 * @param headshotId The ID of the headshot
 * @returns The checkout session URL
 */
export async function createCheckoutSession(userId: string, headshotId: string): Promise<string> {
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

    return session.url || '';
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new Error('Failed to create checkout session');
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
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return {
        userId: session.metadata?.userId || '',
        headshotId: session.metadata?.headshotId || '',
        paid: false,
      };
    }

    return {
      userId: session.metadata?.userId || '',
      headshotId: session.metadata?.headshotId || '',
      paid: true,
    };
  } catch (error) {
    console.error('Error verifying payment with Stripe:', error);
    throw new Error('Failed to verify payment');
  }
}

export default stripe;