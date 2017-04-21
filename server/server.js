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

app.listen(8079, () => console.log('Listening on 8079'))

exports.app = app
