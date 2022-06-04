import { Client } from 'faunadb';

const SECRET_KET = process.env.FAUNADB_KEY;

if (!SECRET_KET) {
  throw new Error('FAUNA KEY not provided')
}

export const fauna = new Client({
  secret: SECRET_KET
});
