import express from 'express';
import cors from 'cors';
import { templatesRouter } from './routes/templates.js';
import { assetsRouter } from './routes/assets.js';
import { exportRouter } from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/templates', templatesRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
