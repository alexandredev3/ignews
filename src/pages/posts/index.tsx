import { GetStaticProps } from "next";
import Head from "next/head";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../../services/prismicio";

import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: string;
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
            <a href="#" key={post.slug}>
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = getPrismicClient({
    previewData,
  });

  const data = await prismic.getAllByType("post");

  const posts = data.map((post) => {
    const excerpt =
      post.data.content.find(
        (content: { type: string; text: string }) =>
          content.type === "paragraph"
      )?.text ?? "";
    const updatedAt = new Date(post.last_publication_date).toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
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
