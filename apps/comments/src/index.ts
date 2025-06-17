import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { randomBytes } from 'crypto';
import { cors } from 'hono/cors';
import axios from 'axios';

const app = new Hono();

type CommentModerated = {
  type: 'CommentModerated';
  data: TCommentEvent['data'];
};

type TCommentStatus = 'approved' | 'rejected' | 'pending';

export type TComment = {
  id: string;
  content: string;
  status: TCommentStatus;
};

export type TCommentsByPostId = {
  [key: string]: TComment[];
};

interface TCommentPayload {
  data: {
    id: string;
    postId: string;
    content: string;
    status: TCommentStatus;
  };
}

export interface TCommentEvent extends TCommentPayload {
  type: 'CommentCreated';
}

export interface TCommentUpdatedEvent extends TCommentPayload {
  type: 'CommentUpdated';
}

const commentsByPostId: TCommentsByPostId = {};

app.use(cors());

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
  comments.push({ id: commentId, content, status: 'pending' });

  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId,
      status: 'pending',
    },
  } satisfies TCommentEvent);

  return c.json(comments, 201);
});

app.post('/events', async (c) => {
  const body: CommentModerated = await c.req.json();

  if (body.type === 'CommentModerated') {
    console.log('moderatedComment');
    const { id, postId, status } = body.data;

    const comments = commentsByPostId[postId] || [];
    const comment = comments.find((c) => c.id === id);

    if (!comment) {
      return c.json({ status: 'Comment not found' }, 404);
    }
    if (comment) {
      comment.status = status;
    }

    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        postId,
        ...comment,
      },
    } satisfies TCommentUpdatedEvent);
  }

  return c.json({ status: 'OK' }, 200);
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
