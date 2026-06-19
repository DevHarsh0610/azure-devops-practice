import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { apiRouter } from './routes/index.js';

const app = express();

// Core Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- API Routes ---
app.use('/', apiRouter);

// --- 404 & Global Error Handling ---
app.use(notFound);
app.use(errorHandler);

export default app;
export { app };

