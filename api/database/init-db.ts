import { db } from "../src/index";


const createTableUser = () => {
  const query = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    username TEXT,
    password TEXT
    )`;

  db.run(query, (err) => {
    if (err) {
      console.log('Error creating table users');
    } else {
      console.log('Table users created');
    }
  });
};



const createTableTask = () => {
  const query = `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    list_id INTEGER,
    user_id INTEGER,
    deadline TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (list_id) REFERENCES lists(id)
  )`;

  db.run(query, (err) => {
    if (err) {
      console.log('Error creating table tasks');
    } else {
      console.log('Table tasks created');
    }
  });
};

const createTableList = () => {
  const query = `CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    owner_id INTEGER,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  )`;


  db.run(query, (err) => {
    if (err) {
      console.log('Error creating table lists');
    } else {
      console.log('Table lists created');
    }
  });
};


const createLinkTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS users_lists (
    user_id INTEGER,
    list_id INTEGER,
    FOREIGN KEY (list_id) REFERENCES lists(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    PRIMARY KEY (user_id, list_id)
  )`;

  db.run(query, (err) => {
    if (err) {
      console.log('Error creating table users_lists');
    } else {
      console.log('Table lists created');
    }
  });
};


createTableUser();
createTableList();
createTableTask();
