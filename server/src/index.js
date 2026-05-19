import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './utils/db.js';
import routes from './routers/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running smoothly' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on port ${PORT}`);
});

connectDB();
