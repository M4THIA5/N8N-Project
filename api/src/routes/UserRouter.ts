import router from 'express';
import { db } from '../index';


const userRouter = router.Router();


userRouter.post('/new', (req, res) => {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
        res.status(400).send('Invalid input');
        return;
    }
    const query = 'INSERT INTO users (name, username, password) VALUES (?, ?, ?)';

    db.run(query, [name, username, password], function (err) {
        if (err) {
            res.status(500).send('Error inserting new user');
        } else {
            res.status(201).send(`New user created with id ${this.lastID}`);
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
    db.get(query, [username, password], (err, row) => {
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
    db.get(query, [username, password], (err, row) => {
        if (err) {
            res.status(500).send('Error fetching user');
            return;
        }

        if (!row) {
            res.status(401).send('Invalid credentials');
            return;
        }

        if (row.id !== parseInt(req.params.id)) {
            res.status(403).send('Forbidden');
            return;
        }

        const query1 = 'DELETE FROM users WHERE id = ?';

        db.run(query1, [req.params.id], function (err) {
            if (err) {
                res.status(500).send('Error deleting user');
            } else {
                res.status(200).send(`User deleted with id ${req.params.id}`);
            }
        });

    });
});

export default userRouter;