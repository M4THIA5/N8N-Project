import router from 'express';
import { db } from '../index';

const taskRouter = router.Router();

taskRouter.get('/', (req, res) => {
  const query = 'SELECT * FROM tasks';

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching tasks');
    } else {
      res.json(rows);
    }
  });
});

taskRouter.get('/:id', (req, res) => {
  const query = 'SELECT * FROM tasks WHERE id = ?';

  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching task');
    } else {
      res.status(200).json(row);
    }
  });
});

taskRouter.post('/', (req, res) => {
  const { name, description, list_id } = req.body;
  const query = 'INSERT INTO tasks (name, description, list_id) VALUES (?, ?, ?)';

  db.run(query, [name, description, list_id], function (err) {
    if (err) {
      res.status(500).send('Error inserting new task');
    } else {
      res.status(201).send(`New task created with id ${this.lastID}`);
    }
  });
});

taskRouter.put('/:id', (req, res) => {
  const { name, description, list_id } = req.body;
  const query = 'UPDATE tasks SET name = ?, description = ?, list_id = ? WHERE id = ?';

  db.run(query, [name, description, list_id, req.params.id], function (err) {
    if (err) {
      res.status(500).send('Error updating task');
    } else {
      res.status(200).send(`Task updated with id ${req.params.id}`);
    }
  });
});

export default taskRouter;