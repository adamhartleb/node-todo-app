const { User } = require('../models/user')
const bcrypt = require('bcryptjs')

exports.hashing = (req, res, next) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      req.email = req.body.email
      req.password = hash
      next()
    })
  })
}