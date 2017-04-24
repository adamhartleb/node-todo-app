const { ObjectID } = require('mongodb')
const { Todo } = require('../server/models/todo')
const { mongoose } = require('../server/db/mongoose')

new Todo({
  text: 'ay you tharrr'
}).save()
