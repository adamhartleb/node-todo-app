const expect = require('expect')
const request = require('supertest')

const { ObjectID } = require('mongodb')
const { app } = require('../server')
const { Todo } = require('../models/todo')
const { User } = require('../models/user')

const todos = [
  { _id: ObjectID(), text: 'First text todo' }, { _id: ObjectID(), text: 'Second text todo' }
]

beforeEach(done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done())
})

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'test todo text'

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) return done(err)
        
        Todo.find().then(todos => {
          expect(todos.length).toBe(3)
          expect(todos[todos.length - 1].text).toBe(text)
          done()
        }).catch(err => done(err))
      })
  })
  it('should not create a todo with invalid data', done => {
    const text = 6

    request(app)
      .post('/todos')
      .send({ text })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)

        Todo.find().then(todos => {
          expect(todos.length).toBe(2)
          done()
        }).catch(e => done(ez))
      })
  })

  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)

        expect(res.body.todos.length).toBe(todos.length)
        done()
      })
  })

  it('should retrieve a single todo by id', done => {
    request(app)
      .get(`/todos/${todos[0]._id}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toInclude(todos[0])
        done()
      })
  })
})

