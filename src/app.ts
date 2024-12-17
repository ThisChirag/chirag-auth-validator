import express, { Application } from 'express';
import route from './routes/userRoutes';
import dotenv from 'dotenv';
import docsRouter from './docs';

dotenv.config();

const app: Application = express();

app.use(express.json());

//pretty print
app.set('json space', 2);
app.use('/api', route);
app.use('/docs', docsRouter);

export default app;
