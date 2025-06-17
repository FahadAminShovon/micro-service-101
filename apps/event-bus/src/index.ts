import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import axios from 'axios';

const app = new Hono();

const events: any[] = [];

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.post('/events', async (c) => {
  const event = await c.req.json();

  events.push(event);

  try {
    const promises = [
      // post
      axios.post('http://localhost:4000/events', event),
      // comments
      axios.post('http://localhost:4001/events', event),
      // query
      axios.post('http://localhost:4002/events', event),
      // moderation
      axios.post('http://localhost:4003/events', event),
    ];
    await Promise.all(promises);
  } catch (e) {
    // console.error(e);
  }
  return c.json({ status: 'OK' }, 200);
});

app.get('/events', (c) => {
  return c.json({ events }, 200);
});

serve(
  {
    fetch: app.fetch,
    port: 4005,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
