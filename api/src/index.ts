import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import taskRouter from './routes/TaskRoute';
import listRouter from './routes/ListRouter';
import userRouter from './routes/UserRouter';
import sqlite3 from 'sqlite3';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

export const db = new sqlite3.Database('./database/db.sqlite');

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(bodyParser.urlencoded());
app.use('/tasks', taskRouter);
app.use('/lists', listRouter);
app.use('/users', userRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});