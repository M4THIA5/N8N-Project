import router from 'express';
import { db } from '../index';

const listRouter = router.Router();

listRouter.get('/', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.get(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }
    const query = 'SELECT * FROM lists where user_id = ?';

    db.all(query, [row.id], (err, rows) => {
      if (err) {
        res.status(500).send('Error fetching lists');
      } else {
        res.status(200).json(rows);
      }
    });
  });
});

listRouter.get('/:id', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.get(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }
    const query = 'SELECT * FROM lists WHERE id = ? and user_id = ?';

    db.get(query, [req.params.id, row.id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
      }
      if (!row) {
        res.status(404).send('List not found');
      } else {
        res.status(200).json(row);
      }
    });
  });
});

listRouter.post('/', (req, res) => {
  const { username, password, name, description } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.get(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }
    if (!name || !description) {
      res.status(400).send('Invalid input');
      return;
    }

    const query = 'INSERT INTO lists (name, description, user_id) VALUES (?, ?, ?)';

    db.run(query, [name, description, row.id], function (err) {
      if (err) {
        res.status(500).send('Error inserting new list');
      } else {
        res.status(201).send(`New list created with id ${this.lastID}`);
      }
    });
  });
});

listRouter.put('/:id', (req, res) => {
  const { username, password, name, description } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.get(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }
    if (!name || !description) {
      res.status(400).send('Invalid input');
      return;
    }

    const check = 'SELECT * FROM lists WHERE id = ? AND user_id = ?';

    db.get(check, [req.params.id, row.id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
        return;
      }
      if (!row) {
        res.status(404).send('List not found');
        return;
      }
      if (!name && !description) {
        res.status(400).send('Invalid input');
        return;
      }

      let query = 'UPDATE lists';
      if (name) {
        query += ' SET name = ' + name;
      }
      if (description) {
        if (name) {
          query += ',';
        }
        query += ' SET description = ' + description;
      }
      query += 'WHERE id = ?';
      db.run(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error updating list');
        } else {
          res.status(200).send(`List updated with id ${req.params.id}`);
        }
      });
    });
  });
});

export default listRouter;