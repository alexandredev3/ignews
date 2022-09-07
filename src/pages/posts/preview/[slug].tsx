import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PrismicText, PrismicRichText } from "@prismicio/react";
import * as prismicHelpers from "@prismicio/helpers";
import { RichTextField } from "@prismicio/types";
import { useSession } from 'next-auth/react';

import { createPrismicClient } from "../../../services/prismicio";

import { getPreview } from '../../../utils';

import styles from "../post.module.scss";

type Params = {
  slug: string;
};

interface PostPreviewProps {
  post: {
    title: RichTextField;
    slug: string;
    content: RichTextField;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (data?.user.subscription) {
      router.push('/posts/' + post.slug);
    }
  }, [data?.user.subscription]);

  return (
    <>
      <Head>
        <title>{prismicHelpers.asText(post.title)} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.article_wrapper}>
          <h1>
            <PrismicText field={post.title} />
          </h1>
          <time>{post.updatedAt}</time>

          <div className={`${styles.content} ${styles.previewContent}`}>
            <PrismicRichText field={post.content} />
          </div>

          <div className={styles.subscribeNowWrapper}>
            Get full access to this article
            <Link href="/">
              <a href="">Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: {
          slug: "static-vs-unit-vs-integration-vs-e2e-testing-for-frontend",
        },
      },
    ],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<any, Params> = async ({
  params,
}) => {
  const slug = params?.slug;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  const prismic = createPrismicClient();

  const response = await prismic.getByUID("post", slug);

  const title = response.data.title;
  const content = getPreview(response.data.content);
  const updatedAt = new Date(response.last_publication_date).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const post = {
    slug,
    title,
    content,
    updatedAt,
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 min
  };
};
