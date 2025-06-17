import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import type { TCommentEvent } from '@repo/comments/types';
import axios from 'axios';

const app = new Hono();

type CommentModerated = {
  type: 'CommentModerated';
  data: TCommentEvent['data'];
};

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.post('/events', async (c) => {
  const event: TCommentEvent = await c.req.json();

  console.log('moderation event', event);
  if (event.type === 'CommentCreated') {
    const comment = event.data;
    if (comment.content.toLowerCase().includes('orange')) {
      comment.status = 'rejected';
    } else {
      comment.status = 'approved';
    }

    await axios.post('http://localhost:4001/events', {
      type: 'CommentModerated',
      data: comment,
    } satisfies CommentModerated);
  }

  return c.json({ status: 'OK' }, 200);
});

serve(
  {
    fetch: app.fetch,
    port: 4003,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
