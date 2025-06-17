import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { TPost, TPostEvent } from '@repo/posts/types';
import type {
  TCommentEvent,
  TComment,
  TCommentUpdatedEvent,
} from '@repo/comments/types';
import axios from 'axios';

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

function eventHandler(event: TEvent) {
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
      return;
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
      return;
    }
    const exisitingComments = posts[postId].comments || [];

    const comment = exisitingComments.find((c) => c.id === id);
    if (!comment) {
      return;
    }
    comment.status = status;
    comment.content = content;
  }
}

app.post('/events', async (c) => {
  const event: TEvent = await c.req.json();
  eventHandler(event);
  return c.json({ message: 'Event processessed successfully' });
});

serve(
  {
    fetch: app.fetch,
    port: 4002,
  },
  async (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    const res = await axios.get('http://localhost:4005/events');
    const events: TEvent[] = res.data.events ?? [];
    events.forEach(eventHandler);
  }
);
