import * as prismicClient from "@prismicio/client";
import { GetStaticProps } from "next";
import Head from "next/head";

import { createPrismicClient } from '../../services/prismicio';

import styles from "./styles.module.scss";

export default function Posts() {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <a href="#">
            <time>12 março de 2022</time>
            <strong>The State Reducer Pattern with React Hooks</strong>
            <p>
              A while ago, I developed a new pattern for enhancing your React
              components calledthe state reducer pattern.{" "}
            </p>
          </a>
          <a href="#">
            <time>12 março de 2022</time>
            <strong>The State Reducer Pattern with React Hooks</strong>
            <p>
              A while ago, I developed a new pattern for enhancing your React
              components calledthe state reducer pattern.{" "}
            </p>
          </a>
          <a href="#">
            <time>12 março de 2022</time>
            <strong>The State Reducer Pattern with React Hooks</strong>
            <p>
              A while ago, I developed a new pattern for enhancing your React
              components calledthe state reducer pattern.{" "}
            </p>
          </a>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = createPrismicClient({ previewData });

  const response = await prismic.getByType('post');
  
  return {
    props: {

    }
  }
}