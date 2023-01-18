import jwt from 'jsonwebtoken';
import { redisClient } from '../server.js';

// set token in our Redis database
const setToken = (key, value) => {
  // TODO: make 'new Promise' with resolve and reject
  return Promise.resolve(redisClient.set(key, value));
};

const signToken = (email) => {
  // see docs at https://www.npmjs.com/package/jsonwebtoken
  const jwtPayload = { email }; // we sign a token with the user's email(putting it into an object)
  return jwt.sign(jwtPayload, 'JWT_SECRET', { expiresIn: '2 days' }); // returning generated token
};

const createSession = (user) => {
  // create JWT token and return user data
  const { email, id } = user;
  const token = signToken(email); // we sign a token with the user's email
  return (
    setToken(token, id)
      // onse the token is set and there is no error we gonna return this object
      .then(() => {
        return { ...user, success: 'true', userId: id, token };
      })
      // otherwise we gonna return the error
      .catch('unable to set token') // for production
    // .catch(console.log) // for debuging
  );
};

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password, 10);
  db.transaction((trx) => {
    // we create a transaction when we have to do more than two things at once and thus we use transaction object 'trx' instead of 'db'
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        return (
          trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date(),
            })
            // get the user - knex returns us an array of inserted to db rows, so we use here 'user[0]' and it only means, that we don't want to get it as an array, we want the response to be the object only instead
            .then((user) => user[0])
            .then((data) => createSession(data))
            .then((user) => {
              res.json(user);
            })
        );
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
    // .catch((err) => res.status(400).json(`unable to register --> "${err}"`)); // for debuging
    .catch(() => res.status(400).json('unable to register')); // for production
};

export default handleRegister;
