const { ObjectID } = require('mongodb')
const { User } = require('../server/models/user')
const { mongoose } = require('../server/db/mongoose')

new User({
  email: 'ay you thar'
}).save().then(doc => {
  User.findById(doc._id).then(doc => {
    console.log(ObjectID.isValid(doc._id))
  })
})
