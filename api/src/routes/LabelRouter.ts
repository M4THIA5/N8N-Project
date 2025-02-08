import router from 'express';
import { db } from '../index';

const labelRouter = router.Router();

labelRouter.get('/', (req, res) => {
  res.status(200).send('Available colors : red, blue, green, yellow, purple, pink, orange, brown, black, white (with modifiers : _light or _dark)');
});

labelRouter.post('/', (req, res) => {
  const { username, password, name, color } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.query(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }
    if (!name && !color) {
      res.status(400).send('Invalid input');
      return;
    }

    const query = 'INSERT INTO label (name, color) VALUES (?, ?)';

    db.query(query, [name, color], function (err, ro) {
      if (err) {
        res.status(500).send('Error inserting new list');
      } else {
        if (ro) {
          const postData = JSON.stringify({
            name: name,
            color: color,
          });
        const options = {
          port: 443,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        };
        const request = https.request("https://winning-sheep-only.ngrok-free.app/webhook/90f59e86-c783-4fd4-a7a7-1e6a24bdbae5", options, function (resu) {
          console.log('STATUS: ' + resu.statusCode);
          console.log('HEADERS: ' + JSON.stringify(resu.headers));
          resu.setEncoding('utf8');
          resu.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
          });
        })
        request.write(postData);
        request.end();
        res.status(201).send(`New label created`);
      }
    });
  });
});

labelRouter.put('/:id', (req, res) => {
  const { username, password, name, description } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.query(auth, [username, password], (err, row) => {
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

    db.query(check, [req.params.id, row[0].id], (err, row) => {
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
      db.query(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error updating list');
        } else {
          res.status(200).send(`List updated with id ${req.params.id}`);
        }
      });
    });
  });
});

labelRouter.delete('/:id', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.query(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }

    const check = 'SELECT * FROM lists WHERE id = ? AND owner_id = ?';

    db.query(check, [req.params.id, row[0].id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
        return;
      }
      if (!row) {
        res.status(404).send('List not found');
        return;
      }

      const query = 'DELETE FROM lists WHERE id = ?';

      db.query(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error deleting list');
        } else {
          db.query('DELETE FROM lists_user WHERE list_id = ?', [req.params.id], function (err) {
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

labelRouter.get('/:id/tasks', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }

  const auth = 'SELECT id FROM users WHERE username = ? AND password = ?';

  db.query(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row) {
      res.status(401).send('Authentication failed');
      return;
    }

    const check = 'SELECT * FROM lists_user WHERE list_id = ? AND user_id = ?';

    db.query(check, [req.params.id, row[0].id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
        return;
      }
      if (!row) {
        res.status(404).send('List not found');
        return;
      }

      const query = 'SELECT * FROM tasks WHERE list_id = ?';

      db.query(query, [req.params.id], (err, rows) => {
        if (err) {
          res.status(500).send('Error fetching tasks');
        } else {
          res.status(200).json(rows);
        }
      });
    });
  });
});

labelRouter.put('/adduser/:id', (req, res) => {
  const { username, password, user_id } = req.body;

  if (!username || !password || !user_id) {
    res.status(400).send('Invalid input');
    return;
  }

  const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(auth, [username, password], (err, rowOne) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!rowOne) {
      res.status(401).send('Authentication failed');
      return;
    }

    const newAuth = 'SELECT id FROM users WHERE id = ?';
    db.query(newAuth, [user_id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching new user');
        return;
      }
      if (!row) {
        res.status(404).send('User not found');
        return;
      }

      const check = 'SELECT * FROM lists_user WHERE list_id = ? AND user_id = ?';
      db.query(check, [req.params.id, rowOne[0].id], (err, row) => {
        if (err) {
          res.status(500).send('Error fetching list');
          return;
        }
        if (row) {
          res.status(400).send('User already in list');
          return;
        }

        const query = 'INSERT INTO lists_user (list_id, user_id) VALUES (?, ?)';
        db.query(query, [req.params.id, rowOne[0].id], function (err) {
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

labelRouter.put('/removeuser/:id', (req, res) => {
  const { username, password, user_id } = req.body;

  if (!username || !password || !user_id) {
    res.status(400).send('Invalid input');
    return;
  }

  const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(auth, [username, password], (err, rowOne) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!rowOne) {
      res.status(401).send('Authentication failed');
      return;
    }

    const newAuth = 'SELECT id FROM users WHERE id = ?';
    db.query(newAuth, [user_id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching new user');
        return;
      }
      if (!row) {
        res.status(404).send('User not found');
        return;
      }

      const check = 'SELECT * FROM lists_user WHERE list_id = ? AND user_id = ?';
      db.query(check, [req.params.id, rowOne[0].id], (err, row) => {
        if (err) {
          res.status(500).send('Error fetching list');
          return;
        }
        if (!row) {
          res.status(400).send('User not in list');
          return;
        }

        const query = 'DELETE FROM lists_user WHERE list_id = ? AND user_id = ?';
        db.query(query, [req.params.id, rowOne[0].id], function (err) {
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

export default labelRouter;