import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes         from './routes/auth';
import eventRoutes        from './routes/events';
import registrationRoutes from './routes/registrations';

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/registrations', registrationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventregistration';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err: Error) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
