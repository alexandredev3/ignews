import Head from 'next/head';
import { GetStaticProps } from 'next';

import { SubscribeButton } from '../components/SubscribeButton';

import { stripe } from '../services/stripe';

import styles from './home.module.scss';

interface HomeProps {
  product: {
    id: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.container}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>

          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton priceId={product.id} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // retrice will return only one price.
  // retrieve parameter is the product id.
  // optional expand: ['product'] all the product information.
  const product = await stripe().prices.retrieve('price_1KSjuEB28VxnKeelslCdP9S4');

  // unit_amount returns in cents.
  const { id, unit_amount } = product;

  return {
    props: {
      product: {
        id,
        amount: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(((unit_amount || 0) / 100))
      }
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}
