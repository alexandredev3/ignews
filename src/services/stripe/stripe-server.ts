import Stripe from 'stripe';

import app from '../../../package.json';

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;

if (!STRIPE_API_KEY) {
  throw new Error('STRIPE API KEY not provided');
}

export const stripeServer = new Stripe(
  STRIPE_API_KEY,
  {
    apiVersion: '2020-08-27',
    appInfo: {
      name: 'Ignews',
      version: app.version
    }
  }
);