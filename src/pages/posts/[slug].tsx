import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { PrismicText, PrismicRichText } from "@prismicio/react";
import * as prismicHelpers from "@prismicio/helpers";
import { RichTextField } from "@prismicio/types";

import { createPrismicClient } from "../../services/prismicio";

import styles from "./post.module.scss";

type Params = {
  slug: string;
};

interface PostProps {
  post: {
    title: RichTextField;
    slug: string;
    content: RichTextField;
    updatedAt: string;
  };
}

export default function Post({ post }: PostProps) {
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

          <div className={styles.content}>
            <PrismicRichText
              field={post.content}
            />
          </div>
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<any, Params> = async ({
  req,
  params,
}) => {
  const session = await getSession({ req });
  const slug = params?.slug;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  if (!session?.user.subscription) {
    return {
      redirect: {
        destination: '/posts/preview/' + slug,
        permanent: false
      }
    }
  }

  const prismic = createPrismicClient({ req });

  const response = await prismic.getByUID("post", slug);

  const title = response.data.title;
  const content = response.data.content;
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
  };
};
