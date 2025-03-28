'use client';

import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const tiers = [
  {
    name: 'Basic',
    id: 'basic',
    priceId: 'price_1R7chHK9ng7JDxkssJ8d6c7z',
    price: '$3',
    description: 'Perfect for trying out our AI headshot generation.',
    features: [
      '5 AI-generated headshots',
      'Basic editing features',
      'Standard resolution',
      'Download in common formats',
      '24/7 support',
    ],
  },
  {
    name: 'Standard',
    id: 'standard',
    priceId: 'price_1R7chOK9ng7JDxks72EkHs7c',
    price: '$5',
    description: 'Great for professionals needing more options.',
    features: [
      '10 AI-generated headshots',
      'Advanced editing features',
      'High resolution',
      'Multiple background options',
      'Priority support',
      'Commercial usage rights',
    ],
  },
  {
    name: 'Pro',
    id: 'pro',
    priceId: 'price_1R7chXK9ng7JDxksDwqXrUHn',
    price: '$20',
    description: 'Best for businesses and power users.',
    features: [
      '25 AI-generated headshots',
      'Premium editing features',
      'Ultra-high resolution',
      'Custom background options',
      'Priority support',
      'Commercial usage rights',
      'Advanced customization',
      'Bulk generation',
    ],
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceId: 'price_1R7chfK9ng7JDxksS7HTgECi',
    price: '$25',
    description: 'Custom solution for large teams.',
    features: [
      '50 AI-generated headshots',
      'All premium features',
      'Multiple editing rounds',
      'Maximum resolution',
      'Custom branding options',
      'Dedicated support',
      'Commercial usage rights',
      'Advanced customization',
      'Bulk generation',
      'Team collaboration',
    ],
  },
];

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handlePurchase = async (priceId: string, tierId: string) => {
    try {
      setLoadingTier(tierId);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (error) {
          console.error('Error:', error);
          setLoadingTier(null);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setLoadingTier(null);
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose your perfect plan
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Get professional AI-generated headshots at affordable one-time prices. No subscriptions, no hidden fees.
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                tierIdx === 2 ? 'lg:z-10 lg:rounded-b-none' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tierIdx === 2 ? 'text-indigo-600' : 'text-gray-900'
                    }`}
                  >
                    {tier.name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price}</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">one-time</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handlePurchase(tier.priceId, tier.id)}
                disabled={loadingTier !== null}
                aria-describedby={tier.id}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 relative ${
                  tierIdx === 2
                    ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                } ${loadingTier !== null && 'opacity-75 cursor-not-allowed'}`}
              >
                {loadingTier === tier.id ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Get started'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 