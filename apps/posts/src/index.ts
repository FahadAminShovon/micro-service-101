import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { randomBytes } from 'crypto';

export const app = new Hono();

type TPost = {
  id: string;
  title: string;
};
type TPosts = {
  [key: string]: TPost;
};
const posts: TPosts = {};

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/posts', (c) => {
  return c.json(posts, 200);
});

app.post('/posts', async (c) => {
  const id = randomBytes(4).toString('hex');
  const body = await c.req.json();
  posts[id] = {
    id,
    title: body.title,
  };
  return c.json(posts[id], 201);
});

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
