import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

export const stripeClient = async () => {
  if (!STRIPE_PUBLIC_KEY) {
    throw new Error('[STRIPE_PUBLIC_KEY] not provided');
  }

  return loadStripe(STRIPE_PUBLIC_KEY);
}