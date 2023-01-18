import jwt from 'jsonwebtoken';
import { redisClient } from '../server.js';

// this is a pure funcion that *eventually* returns a promise to whatever funcion is using it
// this means that it shouldn't return any responces('res')!
const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // reject and return the promise wich is used in 'signinAuthentication' as a 'handleSignin' '.catch' block
    // fomelly(before impelementing 'signinAuthentication') the code was:
    // 'return res.status(400).json('incorrect form submission')
    return Promise.reject('incorrect form submission');
  }
  // with promises we ALWAYS want to make sure that we returning them:
  return (
    db
      .select('email', 'hash')
      .from('login')
      .where('email', '=', email)
      // we return promise here as well to be used in 'signinAuthentication` as a 'handleSignin' '.then' block
      .then((data) => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
          return (
            db
              .select('*')
              .from('users')
              .where('email', '=', email)
              // get the user - knex returns us an array of inserted to db rows, so we use here 'user[0]' and it only means, that we don't want to get it as an array, we want the response to be the object only instead
              .then((user) => user[0])
              // once again we reject and return promise to be used in 'signinAuthentication` as a 'handleSignin' '.catch' block
              .catch((err) => Promise.reject('unable to get user'))
          );
        } else {
          // once again we reject and return promise to be used in 'signinAuthentication` as a 'handleSignin' '.catch' block
          Promise.reject('wrong credentials');
        }
      })
      // once again we reject and return promise to be used in 'signinAuthentication` as a 'handleSignin' '.catch' block
      .catch((err) => Promise.reject('wrong credentials'))
  );
};

// this function gets the userId by its token
const getAuthUserId = (req, res) => {
  const { authorization } = req.headers;
  // ('err, reply) => {}' is a callback function of the '.get' method
  // so 'err' = 'nil' in redis db answer and 'reply' = the actual ID nuber in redis db answer
  return redisClient.get(authorization, (err, reply) => {
    // if there is an error or no reply
    if (err || !reply) {
      // we could return a Promise.reject() here and handle it in 'signinAuthentication',
      // but we return response here in order to not clutter that function too much
      return res.status(400).json('Unauthorized');
    }
    // we could return a Promise.resolve() here and handle it in 'signinAuthentication',
    // but we return response here in order to not clutter that function too much
    return res.json({ id: reply });
  });
};

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
        return { success: 'true', userId: id, token };
      })
      // otherwise we gonna return the error
      .catch('unable to set token') // for production
    // .catch(console.log) // for debuging
  );
};

// this is the HOF(Hier Order Function) that receives (db, bcrypt) through "dependency injection"
// from the 'signinAuthentication' handler of '/api/signin' route in 'server.js' and also receives(req, res)
// and we declaring it here this way beacuse of the declaration of the '/api/signin' route(in the 'server.js')
// without the '(req, res) => {}' function
const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? // if there is authorization header(i.e. user already logged in) then grab user's ID
      getAuthUserId(req, res)
    : // if there is no authorization header then perform sign in
      handleSignin(db, bcrypt, req, res) // 'handleSignin' returns promise here
        .then((data) => {
          return data.id && data.email
            ? createSession(data)
            : Promise.reject('wrong credentials'); // for production
          // : Promies.reject(data); // for debuging purposes(to see in network tab of the browser's dev tools)
        })
        .then((session) => res.json(session))
        .catch(
          (err) => res.status(400).json(`Sign In Authentification failed`) // for production
          // res.status(400).json(`Sign In Authentification failed --> "${err}"`) // for debuging
        );
};

export default signinAuthentication;
