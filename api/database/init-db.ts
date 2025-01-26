import { db } from "../src/index";

const createTableTask = () => {
  const query = `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    list_id INTEGER,
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
    description TEXT
  )`;

  db.run(query, (err) => {
    if (err) {
      console.log('Error creating table lists');
    } else {
      console.log('Table lists created');
    }
  });
};

createTableList();
createTableTask();