import { useRouter } from 'next/router';
import { useSession, signIn } from "next-auth/react";

import { api } from "../../services/api";
import { stripeClient } from "../../services/stripe/stripe-js";

import styles from "./styles.module.scss";

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const router = useRouter();
  const { data, status } = useSession();

  async function handleSubscribe() {
    if (data?.user.subscription) {
      router.push('/posts');

      return;
    }

    try {
      if (status === "authenticated") {
        const response = await api.post("/subscribe");

        const { sessionId } = response.data;

        const stripe = await stripeClient();

        await stripe?.redirectToCheckout({ sessionId });
      } else {
        signIn("github");
      }
    } catch (err: any) {
      console.error(err);
      alert("Something went wrong");
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now
    </button>
  );
}
