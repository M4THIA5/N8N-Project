import router from 'express';
import { db } from '../index';
import https from 'https';

const userRouter = router.Router();


userRouter.post('/new', (req, res) => {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
        res.status(400).send({response:'Invalid input', code:400, message:'Invalid input : '});
        return;
    }
    const query = 'INSERT INTO users (name, username, password) VALUES (?, ?, ?)';

    db.execute(query, [name, username, password], function (err, result) {
        if (err) {
            res.status(500).send('Error inserting new user : ' + err);
        } else {
            res.status(201).send(`New user created with id ${"an id"}`); // TODO: fix this
        }
    });
});

userRouter.get('/', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send('Invalid input');
        return;
    }
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, row) => {
        if (err) {
            res.status(500).send('Error fetching user');
        }
        if (!row) {
            res.status(404).send('User not found');
        }
        res.status(200).json(row);
    });
});

userRouter.delete('/:id', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, row) => {
        if (err) {
            res.status(500).send('Error fetching user');
            return;
        }

        if (!row) {
            res.status(401).send('Invalid credentials');
            return;
        }

        if (row[0].id !== parseInt(req.params.id)) {
            res.status(403).send('Forbidden');
            return;
        }

        const query1 = 'DELETE FROM users WHERE id = ?';

        db.execute(query1, [req.params.id], function (err) {
            if (err) {
                res.status(500).send('Error deleting user');
            } else {
                res.status(200).send(`User deleted with id ${req.params.id}`);
            }
        });

    });
});


userRouter.put('/', (req, res) => {
    const { username, password, user_id, list_id } = req.body;
    if (!username || !password) {
        res.status(400).send({response:'Invalid input', code:400, message:'Invalid input'+req.body});
        return;
    }
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, row) => {
        if (err) {
            res.status(500).send('Error fetching user');
            return;
        }
        if (!row) {
            res.status(401).send('Authentication failed');
            return;
        }
        const query1 = 'UPDATE lists SET owner_id = ? WHERE id = ? and owner_id = ?';
        db.execute(query1, [user_id, list_id, row[0].id], function (err) {
            if (err) {
                res.status(500).send('Error updating list');
            } else {
                res.status(200).send(`List updated with id ${list_id}`);
            }
        });
    });
});

userRouter.post('/done/:id', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send('Invalid input');
        return;
    }
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, usr) => {
        if (err) {
            res.status(500).send('Error fetching user:' + err);
            return;
        }
        if (!usr[0]) {
            res.status(401).send('Invalid credentials');
            return;
        }
        const query1 = 'UPDATE tasks SET done = 1 WHERE id = ? and user_id = ? returning *';
        db.execute(query1, [req.params.id, usr[0].id], function (err, row) {
            if (err) {
                res.status(500).send('Error updating task :'+ err);
            } else {

                const postData = JSON.stringify({
                    'taskname': row[0].name,
                    'username': usr[0].name,
                })

                const options = {
                    port: 443,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData),
                      },
                };
                const req =https.request("https://winning-sheep-only.ngrok-free.app/webhook/5ff7bd9a-e8d1-46a0-9bea-b84837368d38",options, function (resu) {
                    console.log('STATUS: ' + resu.statusCode);
                    console.log('HEADERS: ' + JSON.stringify(resu.headers));
                    resu.setEncoding('utf8');
                    resu.on('data', function (chunk) {
                        console.log('BODY: ' + chunk);
                    });
                })
                req.write(postData);
                req.end();
                res.status(200).send(`Task updated with id ${req.params.id}`);
            }
        });
    });
});

export default userRouter;