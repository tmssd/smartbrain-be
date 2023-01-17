import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import knex from 'knex';
import morgan from 'morgan';
// const { response } = require('express');

import requireAuth from './middleware/authorization.js';
// import image from './controllers/image.cjs';
import { handleImage, handleApiCall } from './controllers/image.js';
// const image = require('./controllers/image.cjs');
import {
  handleProfileGet,
  handleProfileUpdate,
} from './controllers/profile.js';
import handleRegister from './controllers/register.js';
import signinAuthentication from './controllers/signin.js';

// Database Setup Dockerized - for development and production:
const db = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URI,
});
// Database Setup - for development:
/* const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'tms',
        password: '',
        database: 'smart-brain'
    }
});
 */
// Database Setup - for production:
/* const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        // ssl: true,
        ssl: {
            rejectUnauthorized: false
        },
    }
});
 */

const app = express();

app.use(express.json());

// CORS management:
// allows all connections
/* app.use(cors()) */
// whitelist connections
const whitelist = [
  'https://smartbrain.thomassoard.com:3001',
  'https://smartbrain.thomassoard.com:3000',
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors());
// app.use(cors(corsOptions));

app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.send('success!');
});

app.get('/api', (req, res) => {
  res.send('api endpoint!');
});

/*

app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) }) // here we see what is called 'dependency injection' - we're injecting whatever dependencies('db' and 'bcrypt' in our case) the handleSignin function needs

*/

// Defining 'api/signin' route without '(req, res) => {}' callback, as it will be used in the
// 'signinAuthentication' handler function (wich itself is a Hier Order Function) from the 'signin.js'.
// This is considered as a more cleaner way of defining routes.
app.post('/api/signin', signinAuthentication(db, bcrypt)); // here we see what is called 'dependency injection' - we're injecting whatever dependencies('db' and 'bcrypt' in our case) the handleRegister function needs

app.post('/api/register', (req, res) => {
  handleRegister(req, res, db, bcrypt); // here we see what is called 'dependency injection' - we're injecting whatever dependencies('db' and 'bcrypt' in our case) the handleRegister function needs
});

app.get('/api/profile/:id', requireAuth, (req, res) => {
  handleProfileGet(req, res, db);
});

app.post('/api/profile/:id', requireAuth, (req, res) => {
  handleProfileUpdate(req, res, db);
});

app.put('/api/image', requireAuth, (req, res) => {
  handleImage(req, res, db);
});

app.post('/api/imageurl', requireAuth, (req, res) => {
  handleApiCall(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}...`);
});

/*

/ --> res = this is working
/api/signin --> POST = success/fail
/api/register --> POST = user
/api/profile/:userID --> GET = user
/api/image --> PUT --> user

*/
