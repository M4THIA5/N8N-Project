import router from 'express';
import { db } from '../index';
import https from 'https';

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
    
    if (!isValid(color)) {
    res.status(400).send('Invalid color');
    return;
    }

    const query = 'INSERT INTO labels (name, color) VALUES (?, ?)';
    db.query(query, [name, color], function (err, roww) {
      if (err) {
        res.status(500).send('Error inserting new label'+ err);
      } else {
        const postData = JSON.stringify({
          name: name,
          color: color,
          id: roww.insertId,
        });
        const options = {
          port: 443,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        };
        const request = https.request("https://winning-sheep-only.ngrok-free.app/webhook/create-label", options, function (resu) {
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

    const check = 'SELECT * FROM labels WHERE id = ?';

    db.query(check, [req.params.id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching label');
        return;
      }
      if (!row) {
        res.status(404).send('label not found');
        return;
      }
      if (!isValid(color)) {
        res.status(400).send('Invalid color');
        return;
      }

      let query = 'UPDATE labels';
      if (name) {
        query += ' SET name = ' + name;
      }
      if (color) {
        if (name) {
          query += ',';
        }
        query += ' SET color = ' + color;
      }
      query += 'WHERE id = ?';
      db.query(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error updating label');
        } else {
          const postData = JSON.stringify({
            name: name,
            color: color,
            id: row[0].trello_id
          });
          const options = {
            port: 443,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          };
          const request = https.request("https://winning-sheep-only.ngrok-free.app/webhook/update-label", options, function (resu) {
            console.log('STATUS: ' + resu.statusCode);
            console.log('HEADERS: ' + JSON.stringify(resu.headers));
            resu.setEncoding('utf8');
            resu.on('data', function (chunk) {
              console.log('BODY: ' + chunk);
            });
          })
          request.write(postData);
          request.end();
          res.status(200).send(`label updated with id ${req.params.id}`);
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

    const check = 'SELECT * FROM labels WHERE id = ?';

    db.query(check, [req.params.id], (err, rowr) => {
      if (err) {
        res.status(500).send('Error fetching label');
        return;
      }
      if (!rowr) {
        res.status(404).send('Label not found');
        return;
      }

      const query = 'DELETE FROM labels WHERE id = ?';

      db.query(query, [req.params.id], function (err) {
        if (err) {
          res.status(500).send('Error deleting label');
        } else {
          const postData = JSON.stringify({
            name: rowr[0].name,
          });
          const options = {
            port: 443,
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          };
          const request = https.request("https://winning-sheep-only.ngrok-free.app/webhook/delete-label", options, function (resu) {
            console.log('STATUS: ' + resu.statusCode);
            console.log('HEADERS: ' + JSON.stringify(resu.headers));
            resu.setEncoding('utf8');
            resu.on('data', function (chunk) {
              console.log('BODY: ' + chunk);
            });
          })
          request.write(postData);
          request.end();
          res.status(200).send(`Label deleted with id ${req.params.id}`);
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

    const check = 'SELECT * FROM tasks WHERE list_id = ? AND user_id = ?';

    db.query(check, [req.params.id, row[0].id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
        return;
      }
      if (!row) {
        res.status(404).send('List not found');
        return;
      }

      const query = 'SELECT t.* FROM tasks_labels tl INNER JOIN tasks t on t.id = tl.task_id WHERE label_id = ?';

      db.query(query, [req.params.id], (err, rows) => {
        if (err) {
          res.status(500).send('Error fetching tasks : '+ err);
        } else {
          res.status(200).json(rows);
        }
      });
    });
  });
});

labelRouter.put('/addontask/:id', (req, res) => {
  const { username, password, task_id } = req.body;

  if (!username || !password || !task_id) {
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

    const check = 'SELECT * FROM labels_tasks WHERE label_id = ? AND task_id = ?';
    db.query(check, [req.params.id, task_id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching list');
        return;
      }
      if (row) {
        res.status(400).send('Label already on task');
        return;
      }

      const query = 'INSERT INTO labels_tasks (label_id, task_id) VALUES (?, ?)';
      db.query(query, [req.params.id, task_id], function (err) {
        if (err) {
          res.status(500).send('Error adding label to task');
        } else {
          const postData = JSON.stringify({
            label_id: req.params.id,
            task_id: task_id,
          });
          const options = {
            port: 443,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          };
          const request = https.request("https://winning-sheep-only.ngrok-free.app/webhook/add-label", options, function (resu) {
            console.log('STATUS: ' + resu.statusCode);
            console.log('HEADERS: ' + JSON.stringify(resu.headers));
            resu.setEncoding('utf8');
            resu.on('data', function (chunk) {
              console.log('BODY: ' + chunk);
            });
          })
          request.write(postData);
          request.end();
          res.status(200).send(`Label n°${req.params.id} added to task ${task_id} `);
        }
      });
    });
  });
});


labelRouter.put('/removeontask/:id', (req, res) => {
  const { username, password, task_id } = req.body;

  if (!username || !password || !task_id) {
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

    const check = 'SELECT * FROM labels_tasks WHERE label_id = ? AND task_id = ?';
    db.query(check, [req.params.id, task_id], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching label');
        return;
      }
      if (!row) {
        res.status(400).send('Label not on task');
        return;
      }

      const query = ' DELETE FROM labels_tasks where label_id = ? and task_id = ?';
      db.query(query, [req.params.id, task_id], function (err) {
        if (err) {
          res.status(500).send('Error removing label from task');
        } else {
          const postData = JSON.stringify({
            label_id: req.params.id,
            task_id: task_id,
          });
          const options = {
            port: 443,
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          };
          const request = https.request("https://winning-sheep-only.ngrok-free.app/webhook/remove-label", options, function (resu) {
            console.log('STATUS: ' + resu.statusCode);
            console.log('HEADERS: ' + JSON.stringify(resu.headers));
            resu.setEncoding('utf8');
            resu.on('data', function (chunk) {
              console.log('BODY: ' + chunk);
            });
          })
          request.write(postData);
          request.end();
          res.status(200).send(`Label n°${req.params.id} removed from task ${task_id} `);
        }
      });
    });
  });
});

function isValid(color: string) {
  const regex = /^(red|blue|green|yellow|purple|pink|orange|brown|black|white)(_light|_dark)?$/;
  return regex.exec(color) !== null;
}

export default labelRouter;