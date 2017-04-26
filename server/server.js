require('./config/config')

const express = require('express')
const bodyParser = require('body-parser')
const { sign, verify } = require('jsonwebtoken')


const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose')
const { User } = require('./models/user')
const { Todo } = require('./models/todo')
const { authenticate } = require('./middleware/authenticate')
const bcrypt = require('bcryptjs')

const app = express()

app.use(bodyParser.json())

app.post('/todos', authenticate, (req, res) => {
  new Todo({
    text: req.body.text,
    _creator: req.user._id
  }).save().then(doc => {
    res.send(doc)
  }).catch(e => {
    res.status(400).send(e)
  })
})

app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id }).then(todos => {
    res.send({ todos })
  }).catch(e => res.send(e))
})

app.get('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params
  if (!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOne({ _id: id, _creator: req.user._id }).then(doc => {
    if (!doc) throw 'Not found'
    res.send(doc)
  }).catch(e => res.status(404).send())
})

app.delete('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params
  if (!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOneAndRemove({ _id: id, _creator: req.user._id }).then(doc => {
    if (!doc) throw 'Not found'
    res.send(doc)
  }).catch(e => res.status(404).send())
})

app.patch('/todos/:id', authenticate, (req, res) => {
  const { id } = req.params
  let completedAt
  let { text, completed } = req.body

  if (!ObjectID.isValid(id)) return res.status(404).send()

  if (typeof completed === 'boolean' && completed) {
    completedAt = new Date().getTime()
  } else {
    completed = false
    completedAt = null
  }

  Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { text, completed, completedAt }, { new: true }).then(doc => {
    if (!doc) throw 'Not found'
    res.status(200).send(doc)
  }).catch(e => res.status(404).send(e))
})

app.post('/users', (req, res) => {
  const body = {
    email: req.body.email,
    password: req.body.password
  }

  const user = new User(body)

  user.save().then(() => {
    return user.generateAuthToken()
  })
  .then(token => res.header('x-auth', token).send(user))
  .catch(e => res.status(400).send(e))
})

app.post('/users/login', (req, res) => {
  const { email, password } = req.body
  
  User.findByCredentials(email, password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user)
    })
  }).catch(e => {
    res.status(400).send()
  })
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }).catch(e => res.status(400).send())
})

app.listen(process.env.PORT, () => console.log(`Listening on ${process.env.PORT}`))

exports.app = app
