import express, { Application, NextFunction, Request, Response } from 'express';
import route from './routes/userRoutes';
import dotenv from 'dotenv';
import docsRouter from './docs';
import syntaxError from './middlewares/syntaxError';

dotenv.config();

const app: Application = express();

app.use(express.json());

app.set('json space', 2);

app.use('/api', route);
app.use('/docs', docsRouter);

app.use(syntaxError);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
