import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { randomBytes } from 'crypto';

const app = new Hono();

type TComment = {
  id: string;
  content: string;
};

type TCommentsByPostId = {
  [key: string]: TComment[];
};

const commentsByPostId: TCommentsByPostId = {};

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/posts/:id/comments', (c) => {
  const postId = c.req.param('id');
  const comments = commentsByPostId[postId] ?? [];
  return c.json(comments, 200);
});

app.post('/posts/:id/comments', async (c) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = await c.req.json();
  const postId = c.req.param('id');

  const comments = commentsByPostId[postId] ?? [];
  commentsByPostId[postId] = comments;
  comments.push({ id: commentId, content });

  return c.json(comments, 201);
});

serve(
  {
    fetch: app.fetch,
    port: 4001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
