const express = require('express')
const bodyParser = require('body-parser')

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
  Todo.findById(req.params.id).then(doc => {
    if (!doc) throw 'Cannot find this doc'
    res.send(doc)
  }).catch(e => res.send(e))
})

app.listen(8079, () => console.log('Listening on 8079'))

exports.app = app
