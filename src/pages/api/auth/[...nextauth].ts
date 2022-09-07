import NextAuth, { Session } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { query as q } from 'faunadb';

import { fauna } from '../../../services/faunadb';
import { Subscription } from "../../../@types/next-auth";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user'
        }
      },
      httpOptions: {
        timeout: 40000 // avoid local network issues
      }
    }),
  ],
  debug: true,
  callbacks: {
    session: async ({ session }) => {
      const { user } = session;

      let updatedSession: Session = {
        ...session,
        user: {
          ...session.user,
          subscription: null
        }
      };

      try {
        const userActiveSubscription = await fauna.query<Subscription>(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  'ref',
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(user?.email!)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        );
  
        updatedSession.user.subscription = userActiveSubscription;
      } catch(err) {
        console.error(err);
      }

      return updatedSession;
    },
    signIn: async ({ user }) => {
      const { email } = user;

      try {
        if (email) {
          await fauna.query(
            q.If(
              q.Not(
                q.Exists(
                  q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(email) // normalizes the email value
                  )
                )
              ),
              q.Create(
                q.Collection('users'), // We need to say what collection this user will be inserted into.
                {
                  data: {
                    email
                  }
                }
              ),
              q.Get(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(email) // normalizes the email value
                )
              )
            )
          )
        } else {
          throw new Error("User doesn't have a public email.");
        }

        return true;
      } catch(err: any) {
        console.error(err);

        return false;
      }
    }
  }
})