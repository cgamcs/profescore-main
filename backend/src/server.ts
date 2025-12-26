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

// Rutas públicas
app.use('/api/faculties', facultyRoutes);

// Rutas administrativas (login y operaciones protegidas)
app.use('/api/admin', adminRoutes);

export default app;