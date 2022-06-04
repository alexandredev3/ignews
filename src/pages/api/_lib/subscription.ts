import { query as q } from 'faunadb';

import { fauna } from '../../../services/faunadb';
import { stripeServer } from '../../../services/stripe/stripe-server';

const getSubscription = async (subscriptionId: string, customerId: string, ) => {
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          customerId
        ),
      ),
    )
  );

  const subscription = await stripeServer.subscriptions.retrieve(subscriptionId);

  return {
    id: subscription.id,
    user_id: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id
  }
}

export const unsubscribe = async (subscriptionId: string, customerId: string) => {
  const subscription = await getSubscription(subscriptionId, customerId);

  await fauna.query(
    q.Replace( // it's going to replace all the subscription data.
      q.Select(
        'ref',
        q.Get(
          q.Match(
            q.Index('subscription_by_id'),
            subscriptionId
          ),
        ),
      ),
      {
        data: subscription
      }
    )
  );
}

export const subscribe = async (subscriptionId: string, customerId: string) => {
  const subscription = await getSubscription(subscriptionId, customerId);

  await fauna.query(
    q.Create(
      q.Collection('subscriptions'),
      { 
        data: subscription 
      }
    )
  )
}