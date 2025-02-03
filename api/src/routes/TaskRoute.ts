import router from 'express';
import { db } from '../index';
import https from 'https';

const taskRouter = router.Router();

taskRouter.get('/', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(auth, [username, password], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching user');
        return;
      }
      if (!row[0]) {
        res.status(401).send('Invalid credentials');
        return;
      }
      const query = 'SELECT * FROM tasks where user_id = (SELECT id FROM users WHERE username = ? AND password = ?)';
      db.query(query, [req.body.username, req.body.password], (err, rows) => {
        if (err) {
          res.status(500).send('Error fetching tasks : ' + err);
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
  db.query(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row[0]) {
      res.status(401).send('Invalid credentials');
      return;
    }
    const query = 'SELECT * FROM tasks WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ? AND password = ?)';
    db.query(query, [req.params.id, username, password], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching task');
      }
      if (row) {
        res.status(200).json(row);
      } else {
        res.status(404).send('Task not found');
      }
    });
  });
});

taskRouter.post('/', (req, res) => {
  const { username, password, name, description, list_id, deadline } = req.body;
  if (username && password) {
    const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(auth, [username, password], (err, usr) => {
      if (err) {
        res.status(500).send('Error fetching user');
        return;
      }
      if (!usr[0]) {
        res.status(401).send('Invalid credentials');
        return;
      }
      if (!name || !description) {
        res.status(400).send('Invalid input');
        return;
      }
      let query;
      let params = [name, description, usr[0].id, deadline];
      if (list_id) {
        console.log('list_id', list_id);
        query = 'INSERT INTO tasks (name, description, user_id,deadline, list_id) VALUES (?, ?, ?, ?, ?)';
        params.push(list_id == undefined ? null : list_id);
      } else {
        query = 'INSERT INTO tasks (name, description,user_id, deadline ) VALUES (?, ?,?, ?)';
      }
      console.log('params', params);
      db.query(query, params, function (err) {
        if (err) {
          res.status(500).send('Error inserting new task: ' + err);
        } else {
          const postData = JSON.stringify({
            'taskname': name,
            'deadline': deadline,
            'description': description,
            'list_id': (list_id ?? null),
            'username': usr[0].name,
          })
          const options = {
            port: 443,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          };
          const req = https.request("https://winning-sheep-only.ngrok-free.app/webhook/1692e99b-4c05-431b-be33-2287695532b9", options, function (resu) {
            console.log('STATUS: ' + resu.statusCode);
            console.log('HEADERS: ' + JSON.stringify(resu.headers));
            resu.setEncoding('utf8');
            resu.on('data', function (chunk) {
              console.log('BODY: ' + chunk);
            });
          })
          req.write(postData);
          req.end();
          res.status(201).send(`New task created with id ${this.lastID}`); // TODO: fix this
        }
      });
    });
  } else {
    res.status(401).send('Authentication required');
  }
});

taskRouter.put('/:id', (req, res) => {
  const { username, password, name, description, list_id, deadline } = req.body;
  if (!username || !password) {
    res.status(401).send('Authentication required');
    return;
  }
  const auth = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(auth, [username, password], (err, row) => {
    if (err) {
      res.status(500).send('Error fetching user');
      return;
    }
    if (!row[0]) {
      res.status(401).send('Invalid credentials');
      return;
    }
    if (!name && !description && !list_id) {
      res.status(400).send('Invalid input');
      return;
    }

    const check = 'SELECT * FROM tasks WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ? AND password = ?)';

    db.query(check, [req.params.id, username, password], (err, row) => {
      if (err) {
        res.status(500).send('Error fetching task');
        return;
      }
      if (!row[0]) {
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
      if (deadline) {
        if (name || description || list_id) {
          query += ','
        }
        query += ' SET deadline= ' + Date.parse(deadline)
      }
      query += ' WHERE id = ?';
      db.query(query, [req.params.id], function (err) {
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