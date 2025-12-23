import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import corsOptions from './config/cors';
import { connectDB } from './config/db';
import facultyRoutes from './routes/facultyRoutes';
import adminRoutes from './routes/adminRoutes';

connectDB();

const app: Express = express();

app.use(express.json());
app.use(cors(corsOptions));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/faculties', facultyRoutes);

app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      console.log('Enviando ping interno...');
      const response = await fetch('https://www.profescore.com/health'); 
      console.log(`Ping status: ${response.status}`);
    } catch (error) {
      console.error('Error en ping interno:', error);
    }
  }, 480000);
}

export default app;