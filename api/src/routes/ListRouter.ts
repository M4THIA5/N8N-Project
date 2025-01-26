import router from 'express';
import { db } from '../index';

const listRouter = router.Router();

listRouter.get('/', (req, res) => {
  const query = 'SELECT * FROM lists';

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching lists');
    } else {
      res.json(rows);
    }
  });
});

listRouter.get('/:id', (req, res) => {
  const query = 'SELECT * FROM lists WHERE id = ?';

  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching list');
    } else {
      res.status(200).json(row);
    }
  });
});

listRouter.post('/', (req, res) => {

  const { name, description } = req.body;
  const query = 'INSERT INTO lists (name, description) VALUES (?, ?)';

  db.run(query, [name, description], function (err) {
    if (err) {
      res.status(500).send('Error inserting new list');
    } else {
      res.status(201).send(`New list created with id ${this.lastID}`);
    }
  });
});

listRouter.put('/:id', (req, res) => {
  const { name, description } = req.body;
  const query = 'UPDATE lists SET name = ?, description = ? WHERE id = ?';

  db.run(query, [name, description, req.params.id], function (err) {
    if (err) {
      res.status(500).send('Error updating list');
    } else {
      res.status(200).send(`List updated with id ${req.params.id}`);
    }
  });
});

export default listRouter;