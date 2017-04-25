const { ObjectID } = require('mongodb')

const { Todo } = require('../../models/todo')
const { User } = require('../../models/user')
const { sign } = require('jsonwebtoken')

const userOneId = ObjectID()
const userTwoId = ObjectID()
const users = [
  { _id: userOneId, 
    email: 'adam@gmail.com', 
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
    }]
  },
  { _id: userTwoId,
    email: 'blah@gmail.com',
    password: 'userTwoPass'
  }
]

const todos = [
  { _id: ObjectID(), text: 'First text todo', completed: false, completedAt: 123, _creator: userOneId }, 
  { _id: ObjectID(), text: 'Second text todo', completed: true, completedAt: 123, _creator: userTwoId }
]

const populateTodos = done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done())
}

const populateUsers = done => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save()
    const userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
}