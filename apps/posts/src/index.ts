import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { randomBytes } from 'crypto';
import { cors } from 'hono/cors';

const app = new Hono();

export type TPost = {
  id: string;
  title: string;
};
export type TPosts = {
  [key: string]: TPost;
};
const posts: TPosts = {};

app.use(cors());
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
