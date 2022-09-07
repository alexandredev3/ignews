import { DefaultSession, Session, User } from 'next-auth';
import { ExprArg } from 'faunadb';

type Status = 'active' | 'canceled' | 'pending';

type Subscription = {
  ref: ExprArg;
  ts: number;
  data: {
    id: string;
    user_id: ExprArg;
    status: Status;
    price_id: string;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & {
      subscription: Subscription | null;
    }
  }
}