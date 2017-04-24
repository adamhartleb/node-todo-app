const express = require('express')
const bodyParser = require('body-parser')

const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose')
const { User } = require('./models/user')
const { Todo } = require('./models/todo')

const app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  new Todo({
    text: req.body.text
  }).save().then(doc => {
    res.send(doc)
  }).catch(e => {
    res.status(400).send(e)
  })
})

app.get('/todos', (req, res) => {
  Todo.find().then(todos => {
    res.send({
      todos
    })
  }).catch(e => res.send(e))
})

app.get('/todos/:id', (req, res) => {
  const { id } = req.params
  if (!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findById(id).then(doc => {
    if (!doc) throw 'Not found'
    res.send(doc)
  }).catch(e => res.status(404).send())
})

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params
  if (!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findByIdAndRemove(id).then(doc => {
    if (!doc) throw 'Not found'
    res.send(doc)
  }).catch(e => res.status(404).send())
})

app.patch('/todos/:id', (req, res) => {
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

  Todo.findByIdAndUpdate(id, { text, completed, completedAt }, { new: true }).then(doc => {
    if (!doc) throw 'Not found'
    res.status(200).send(doc)
  }).catch(e => res.status(404).send(e))
})

app.listen(8079, () => console.log('Listening on 8079'))

exports.app = app
