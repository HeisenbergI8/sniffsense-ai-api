import express from 'express';

const app = express();

// Global middlewares
app.use(express.json());

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
