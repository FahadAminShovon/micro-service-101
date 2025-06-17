import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { TPost, TPostEvent } from '@repo/posts/types';
import type {
  TCommentEvent,
  TComment,
  TCommentUpdatedEvent,
} from '@repo/comments/types';

type TEvent = TPostEvent | TCommentEvent | TCommentUpdatedEvent;

interface TPostWithComment extends TPost {
  comments: TComment[];
}

export type TPostWithCommentCollection = {
  [key: string]: TPostWithComment;
};

const posts: TPostWithCommentCollection = {};

const app = new Hono();
app.use(cors());

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/posts', async (c) => {
  return c.json({ posts }, 200);
});

app.post('/events', async (c) => {
  const event: TEvent = await c.req.json();
  if (event.type === 'PostCreated') {
    const { title, id } = event.data;
    posts[id] = {
      id,
      title,
      comments: [],
    };
  }
  if (event.type === 'CommentCreated') {
    const { id, content, postId, status } = event.data;
    if (!posts?.[postId]) {
      return c.json({ message: 'Post not found' }, 404);
    }
    const exisitingComments = posts[postId].comments || [];
    const updatedComments: TComment[] = [
      ...exisitingComments,
      { id, content, status },
    ];
    posts[postId].comments = updatedComments;
  }
  if (event.type === 'CommentUpdated') {
    const { id, content, postId, status } = event.data;
    if (!posts?.[postId]) {
      return c.json({ message: 'Post not found' }, 404);
    }
    const exisitingComments = posts[postId].comments || [];

    const comment = exisitingComments.find((c) => c.id === id);
    if (!comment) {
      return c.json({ message: 'Comment not found' }, 404);
    }
    comment.status = status;
    comment.content = content;
  }

  return c.json({ message: 'Event processessed successfully' });
});

serve(
  {
    fetch: app.fetch,
    port: 4002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
