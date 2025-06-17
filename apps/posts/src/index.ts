import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { randomBytes } from 'crypto';
import { cors } from 'hono/cors';
import axios from 'axios';

const app = new Hono();

export type TPost = {
  id: string;
  title: string;
};
export type TPosts = {
  [key: string]: TPost;
};

export type TPostEvent = {
  type: 'PostCreated';
  data: {
    id: string;
    title: string;
  };
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
  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: {
      id,
      title: body.title,
    },
  } satisfies TPostEvent);

  return c.json(posts[id], 201);
});

app.post('/events', async (c) => {
  const body = await c.req.json();

  return c.json({ status: 'OK' }, 200);
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
