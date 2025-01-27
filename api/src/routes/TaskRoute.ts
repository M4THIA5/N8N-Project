import router from 'express';
import { db } from '../index';

const taskRouter = router.Router();

taskRouter.get('/', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(auth, [username, password], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching user');
        return;
      }
      if (!row) {
        res.status(401).send('Invalid credentials');
        return;
      }
      const query = 'SELECT * FROM tasks where list_id = (SELECT id FROM lists WHERE user_id = (SELECT id FROM users WHERE username = ? AND password = ?))';
      db.all(query, [req.body.username, req.body.password], (err, rows) => {
        if (err) {
          res.status(500).send('Error fetching tasks');
        } else {
          res.json(rows);
        }
      });
    })
  } else {
    res.status(401).send('Authentication required');
  };
});

taskRouter.get('/:id', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }
  const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Invalid credentials');
      return;
    }
    const query = 'SELECT * FROM tasks WHERE id = ? AND list_id = (SELECT id FROM lists WHERE user_id = (SELECT id FROM users WHERE username = ? AND password = ?))';
    db.get(query, [req.params.id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching task');
      } else {
        res.status(200).json(row);
      }
    });
  });
});

taskRouter.post('/', (req, res) => {
  const { username, password, name, description, list_id } = req.body;
  if (username && password) {
    const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(auth, [username, password], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching user');
        return;
      }
      if (!row) {
        res.status(401).send('Invalid credentials');
        return;
      }
      if (!name || !description || !list_id) {
        res.status(400).send('Invalid input');
        return;
      }
      const query = 'INSERT INTO tasks (name, description, list_id) VALUES (?, ?, ?)';
      db.run(query, [name, description, list_id], function (err) {
        if (err) {
          res.status(500).send('Error inserting new task');
        } else {
          res.status(201).send(`New task created with id ${this.lastID}`);
        }
      });
    });
  } else {
    res.status(401).send('Authentication required');
  }
});

taskRouter.put('/:id', (req, res) => {
  const { username, password, name, description, list_id } = req.body;
  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }
  const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Invalid credentials');
      return;
    }
    if (!name && !description && !list_id) {
      res.status(400).send('Invalid input');
      return;
    }

    const check = 'SELECT * FROM tasks WHERE id = ? AND list_id = (SELECT id FROM lists WHERE user_id = (SELECT id FROM users WHERE username = ? AND password = ?))';

    db.get(check, [req.params.id, username, password], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching task');
        return;
      }
      if (!row) {
        res.status(404).send('Task not found');
        return;
      }
      let query = 'UPDATE tasks'
      if (name) {
        query += ' SET name= ' + name
      }
      if (description) {
        if (name) {
          query += ','
        }
        query += ' SET description= ' + description
      }
      if (list_id) {
        if (name || description) {
          query += ','
        }
        query += ' SET list_id= ' + list_id
      }
      query += ' WHERE id = ?';
      db.run(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error updating task');
        } else {
          res.status(200).send(`Task updated with id ${req.params.id}`);
        }
      });
    });
  });
});

export default taskRouter;