const handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id }) // {id} - here we use ES6 object property declaration shortcut
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not found')
      }
    })
    .catch(err => res.status(404).json('error getting user'))
}

module.exports = {
  handleProfileGet
}
