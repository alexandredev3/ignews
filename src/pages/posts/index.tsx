import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { PrismicText } from "@prismicio/react";
import { RichTextField } from "@prismicio/types";

import { createPrismicClient } from "../../services/prismicio";
import { getExcerpt, dateFormatter } from '../../utils';

import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: RichTextField;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a className={post.slug}>
                <time>{post.updatedAt}</time>
                <strong>
                  <PrismicText field={post.title} />
                </strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = createPrismicClient({
    previewData,
  });

  const data = await prismic.getAllByType("post", {
    orderings: [
      { field: 'document.first_publication_date', direction: 'desc' }
    ],
    fetch: ['document.title', 'document.last_publication_date', 'document.content']
  });

  const posts = data.map((post) => {
    const excerpt = getExcerpt(post.data.content);
    const updatedAt = dateFormatter.format(new Date(post.last_publication_date));

    return {
      slug: post.uid,
      title: post.data.title,
      excerpt,
      updatedAt,
    };
  });

  return {
    props: {
      posts,
    },
  };
};
