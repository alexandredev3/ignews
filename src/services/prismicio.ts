import { createClient, HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import { PreviewData } from 'next';

import sm from '../../sm.json';

type Config = {
  previewData?: PreviewData;
  req?: HttpRequestLike;
}

export const getPrismicClient = (config: Config = {}) => {
  const PRISMIC_ACCESS_TOKEN = process.env.PRISMIC_ACCESS_TOKEN;

  const client = createClient(sm.apiEndpoint, {
    accessToken: PRISMIC_ACCESS_TOKEN
  });

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req
  });

  return client;
}