import express, { Request, Response } from 'express';
import taskRouter from './routes/TaskRoute';
import listRouter from './routes/ListRouter';
import userRouter from './routes/UserRouter';
import mariadb from 'mariadb';
import cors from 'cors';

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

export const db = mariadb.createConnection({
  host: 'mariadb',
  user: 'n8n',
  password: 'n8n',
  database: 'n8n',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/tasks', taskRouter);
app.use('/lists', listRouter);
app.use('/users', userRouter);


app.post('/format',(req:Request,res:Response)=>{
  const {year,month,day, hours, minutes, seconds} = req.body;
  const date = new Date(year, month, day, hours, minutes, seconds);
  if (isNaN(date.getTime())){
    res.status(400).send('Invalid input');
    return;
  }
  res.status(200).json({date: (date.toISOString()).replace("Z", "")});
 })


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});