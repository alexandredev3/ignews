import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { query as q } from 'faunadb';

import { stripeServer } from "../../services/stripe/stripe-server";
import { fauna } from '../../services/faunadb';

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string;
  }
}

const STRIPE_SUCCESS_CALLBACK_URL = process.env.STRIPE_SUCCESS_CALLBACK_URL;
const STRIPE_CANCEL_CALLBACK_URL = process.env.STRIPE_CANCEL_CALLBACK_URL;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const session = await getSession({ req });

      if (session === null) {
        return res.status(401).end("User must signin to subscribe");
      }

      const userEmail = session.user?.email?.toString() ?? '';

      const user = await fauna.query<User>(
        q.Get(
          q.Match(
            q.Index('user_by_email'),
            q.Casefold(userEmail)
          )
        )
      );

      let customerId = user.data.stripe_customer_id;

      if (!customerId) {
        // We also need to create a customer on the Stripe database.
        const stripeCustomer = await stripeServer.customers.create({
          email: userEmail,
        });

        await fauna.query(
          q.Update(
            q.Ref(q.Collection('users'), user.ref.id),
            {
              data: {
                stripe_customer_id: stripeCustomer.id
              }
            }
          )
        );

        customerId = stripeCustomer.id;
      }

      const stripeCheckoutSession = await stripeServer.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'], // what are the payment methods we want the user to have.
        billing_address_collection: 'required', // that means the user is required to fill in his address.
        line_items: [
          { price: 'price_1KSjuEB28VxnKeelslCdP9S4', quantity: 1 }
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: `${STRIPE_SUCCESS_CALLBACK_URL}/posts`,
        cancel_url: `${STRIPE_CANCEL_CALLBACK_URL}/`
      });

      return res.status(200).json({
        sessionId: stripeCheckoutSession.id
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).send('INTERNAL SERVER ERROR');
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}