import { db } from "../src/index";
import https from 'https';
import { key, token } from './trello-credentials';

const createTableUser = () => {
  const query = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT,
    username TEXT,
    password TEXT
    )`;

  db.query(query, (err: Error | null) => {
    if (err) {
      console.log('Error creating table users : ' + err);
    } else {
      console.log('Table users created');
    }
  });
};


const createTableTask = () => {
  const query = `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT,
    description TEXT,
    user_id INTEGER,
    deadline TIMESTAMP,
    trello_id TEXT default null,
    done BOOLEAN DEFAULT 0,
    sent BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`;

  db.query(query, (err: Error | null) => {
    if (err) {
      console.log('Error creating table tasks: ' + err);
    } else {
      console.log('Table tasks created');
    }
  });
};

const createTableLabel = () => {
  const query = `CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT DEFAULT '',
    color TEXT default null,
    trello_id TEXT default null
  )`;


  db.query(query, (err) => {
    if (err) {
      console.log('Error creating table label : '+err );
    } else {
      console.log('Table label created');
    }
  });
};

const createLinkTable = () => {
  const query = `CREATE TABLE IF NOT EXISTS tasks_labels (
    task_id INTEGER, 
    label_id INTEGER,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (label_id) REFERENCES labels(id),
    PRIMARY KEY(task_id, label_id)
  )`;


  db.query(query, (err) => {
    if (err) {
      console.log('Error creating table label : '+err );
    } else {
      console.log('Table label created');
    }
  });
}

const createTrelloLists = () => {
  const auth = `?key=${key}&token=${token}`;
  const options = {
    port: 443,
    method: 'GET'
  };
  const req = https.request(`https://api.trello.com/1/boards/6798f92806125a48079927c3/lists${auth}`, options, function (resu) {
    console.log('STATUS: ' + resu.statusCode);
    console.log('HEADERS: ' + JSON.stringify(resu.headers));
    resu.setEncoding('utf8');
    resu.on('data', function (chunk: string) {
      const body = JSON.parse(chunk);
      let doneList = false;
      let toDoList = false;
      for (const list of body) {
        if (list.name === 'À faire') {
          toDoList = true;
        }
        if (list.name === 'Terminé') {
          doneList = true;
        }
      }
      const options = {
        port: 443,
        method: 'POST'
      };
      const json = JSON.stringify([
        { name: 'À faire', create: toDoList },
        { name: 'Terminé', create: doneList }
      ]);
      const req2 = https.request('https://winning-sheep-only.ngrok-free.app/webhook/create-lists', options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
        });
      });
      req2.write(json);
      req2.end();
    });
  })
  req.end();
}

createTableUser();
createTableLabel();
createTableTask();
createTrelloLists();
