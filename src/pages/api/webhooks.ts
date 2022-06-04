import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import Stripe from "stripe";

import { stripeServer } from "../../services/stripe/stripe-server";
import { subscribe, unsubscribe } from "./_lib/subscription";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const buffer = async (readable: Readable) => {
  const chunks = [];

  for await (let chunk of readable) {
    const chunkToBuffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk; 

    chunks.push(chunkToBuffer);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false // we need to disabled it because we are working with streams.
  }
}

// checkout.session.completed Occurs when the user buys a product on this platform.
// checkout.session.created Occurs when the user buys a product on this platform or other platforms.
const revelantEvents = new Set([
  'checkout.session.completed',
  // 'customer.subscription.created', // removed to avoid duplication in the database
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const secret = req.headers['stripe-signature'];
      const buf = await buffer(req);
  
      let event: Stripe.Event;

      try {
        if (secret && STRIPE_WEBHOOK_SECRET) {
          event = stripeServer.webhooks.constructEvent(buf, secret, STRIPE_WEBHOOK_SECRET);
        } else {
          throw new Error('SECRET not provided');
        }
      } catch (err: any) {
        console.error(err);
        return res.send('Webhook Error');
      }

      const { type } = event;

      if (revelantEvents.has(type)) {
        try {
          switch(type) {
            // case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
              const subscription = event.data.object as Stripe.Subscription;

              await unsubscribe(
                subscription.id,
                subscription.customer.toString()
              )

              break;
            case 'checkout.session.completed':
              const checkoutSession = event.data.object as Stripe.Checkout.Session;

              await subscribe(
                checkoutSession.subscription?.toString() ?? '',
                checkoutSession.customer?.toString() ?? ''
              );

              break;
            default: {
              throw new Error('Unhandled event type')
            }
          }
        } catch(err: any) {
          console.error(err);
          // if set an error status code, stripe is going to retry.
          return res.send('INTERNAL SERVER ERROR');
        }
      }
      
      res.json({ received: true });
    } catch (err: any) {
      console.error(err);
      res.status(500).send('INTERNAL SERVER ERROR');
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}