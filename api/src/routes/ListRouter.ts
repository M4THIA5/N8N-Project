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

  db.execute(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }
    const query = 'SELECT * FROM lists where id in (SELECT list_id FROM lists_user WHERE user_id = ?)';

    db.execute(query, [row[0].id], (err, rows) => {
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

  db.execute(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }
    const query = 'SELECT * FROM lists WHERE id in (SELECT list_id FROM lists_user WHERE user_id = ?) and id = ?';

    db.execute(query, [row[0].id, req.params.id], (err, row) => {
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

  db.execute(auth, [username, password], (err, row) => {
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

    const query = 'INSERT INTO lists (name, description, owner_id) VALUES (?, ?, ?)';

    db.execute(query, [name, description, row[0].id], function (err) {
      if (err) {
        res.status(500).send('Error inserting new list');
      } else {
        db.execute('INSERT INTO lists_user (list_id, user_id) VALUES (?, ?)', [this.lastID, row[0].id], function (err) {
          if (err) {
            res.status(500).send('Error inserting new list');
          }
        });
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

  db.execute(auth, [username, password], (err, row) => {
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

    const check = 'SELECT * FROM lists WHERE id = ? AND owner_id = ?';

    db.execute(check, [req.params.id, row[0].id], (err, row) => {
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
      db.execute(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error updating list');
        } else {
          res.status(200).send(`List updated with id ${req.params.id}`);
        }
      });
    });
  });
});

listRouter.delete('/:id', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.execute(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }

    const check = 'SELECT * FROM lists WHERE id = ? AND owner_id = ?';

    db.execute(check, [req.params.id, row[0].id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
        return;
      }
      if (!row) {
        res.status(404).send('List not found');
        return;
      }

      const query = 'DELETE FROM lists WHERE id = ?';

      db.execute(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error deleting list');
        } else {
          db.execute('DELETE FROM lists_user WHERE list_id = ?', [req.params.id], function (err) {
            if (err) {
              res.status(500).send('Error deleting list');
            }
          });
          res.status(200).send(`List deleted with id ${req.params.id}`);
        }
      });
    });
  });
});

listRouter.get('/:id/tasks', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.execute(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }

    const check = 'SELECT * FROM lists_user WHERE list_id = ? AND user_id = ?';

    db.execute(check, [req.params.id, row[0].id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
        return;
      }
      if (!row) {
        res.status(404).send('List not found');
        return;
      }

      const query = 'SELECT * FROM tasks WHERE list_id = ?';

      db.execute(query, [req.params.id], (err, rows) => {
        if (err) {
          res.status(500).send('Error fetching tasks');
        } else {
          res.status(200).json(rows);
        }
      });
    });
  });
});

listRouter.put('/adduser/:id', (req, res) => {
  const { username, password, user_id } = req.body;

  if (!username || !password || !user_id) {
    res.status(400).send('Invalid input');
    return;
  }

  const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.execute(auth, [username, password], (err, rowOne) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!rowOne) {
      res.status(401).send('Authentication failed');
      return;
    }

    const newAuth = 'SELECT id FROM users WHERE id = ?';
    db.execute(newAuth, [user_id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching new user');
        return;
      }
      if (!row) {
        res.status(404).send('User not found');
        return;
      }

      const check = 'SELECT * FROM lists_user WHERE list_id = ? AND user_id = ?';
      db.execute(check, [req.params.id, rowOne[0].id], (err, row) => {
        if (err) {
          res.status(500).send('Error fetching list');
          return;
        }
        if (row) {
          res.status(400).send('User already in list');
          return;
        }

        const query = 'INSERT INTO lists_user (list_id, user_id) VALUES (?, ?)';
        db.execute(query, [req.params.id, rowOne[0].id], function (err) {
          if (err) {
            res.status(500).send('Error adding user to list');
          } else {
            res.status(200).send(`User ${rowOne[0].username} added to list ${req.params.id}`);
          }
        });
      });
    });
  });
});

listRouter.put('/removeuser/:id', (req, res) => {
    const { username, password, user_id } = req.body;
  
    if (!username || !password || !user_id) {
      res.status(400).send('Invalid input');
      return;
    }
  
    const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.execute(auth, [username, password], (err, rowOne) => {
      if (err) {
        res.status(500).send('Error fetching user');
        return;
      }
      if (!rowOne) {
        res.status(401).send('Authentication failed');
        return;
      }
  
      const newAuth = 'SELECT id FROM users WHERE id = ?';
      db.execute(newAuth, [user_id], (err, row) => {
        if (err) {
          res.status(500).send('Error fetching new user');
          return;
        }
        if (!row) {
          res.status(404).send('User not found');
          return;
        }
  
        const check = 'SELECT * FROM lists_user WHERE list_id = ? AND user_id = ?';
        db.execute(check, [req.params.id, rowOne[0].id], (err, row) => {
          if (err) {
            res.status(500).send('Error fetching list');
            return;
          }
          if (!row) {
            res.status(400).send('User not in list');
            return;
          }
  
          const query = 'DELETE FROM lists_user WHERE list_id = ? AND user_id = ?';
          db.execute(query, [req.params.id, rowOne[0].id], function (err) {
            if (err) {
              res.status(500).send('Error adding user to list');
            } else {
              res.status(200).send(`User ${rowOne[0].username} removed from list ${req.params.id}`);
            }
          });
        });
      });
    });
  });

export default listRouter;