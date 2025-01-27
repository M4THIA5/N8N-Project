import router from 'express';
import { db } from '../index';


const userRouter = router.Router();


userRouter.post('/new', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).send('Invalid input');
        return;
    }
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

    db.run(query, [name, email, password], function (err) {
        if (err) {
            res.status(500).send('Error inserting new user');
        } else {
            res.status(201).send(`New user created with id ${this.lastID}`);
        }
    });
});

userRouter.get('/', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.get(query, [email, password], (err, row) => {
        if (err) {
            res.status(500).send('Error fetching user');
        } else {
            res.status(200).json(row);
        }
    });
});

userRouter.delete('/:id', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.get(query, [email, password], (err) => {
        if (err) {
            res.status(500).send('Error fetching user');
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