const expect = require('expect')
const request = require('supertest')

const { ObjectID } = require('mongodb')
const { app } = require('../server')
const { Todo } = require('../models/todo')
const { User } = require('../models/user')
const { todos, users, populateTodos, populateUsers } = require('./seed/seed')


beforeEach(populateTodos)
beforeEach(populateUsers)

describe('/todos route', () => {
  it('should create a new todo', done => {
    const text = 'test todo text'

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text, _creator: users[0]._id })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) return done(err)
        
        Todo.find({ _creator: users[0]._id }).then(todos => {
          expect(todos.length).toBe(2)
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
      .expect(401)
      .end(done)
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
  it('should return a 404 status if todo not found', done => {
    request(app)
      .get(`/todos/${ObjectID()}`)
      .expect(404)
      .end(done)
  })
  it('should return a 404 status if id param is not valid', done => {
    request(app)
      .get(`/todos/123abc`)
      .expect(404)
      .end(done)
  })
  it('should remove the specified todo', done => {
    request(app)
      .delete(`/todos/${todos[0]._id}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.text).toBe(todos[0].text)
        Todo.find().then(results => {
          expect(results.length).toBe(1)
          done()
        })
      })
  })
  it('should return 404 if id in delete route is not valid', done => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done)
  })
  it('should return 404 if id in delete route is not found', done => {
    request(app)
      .delete(`/todos/${ObjectID()}`)
      .expect(404)
      .end(done)
  })
  it('should update the specified todo', done => {
    request(app)
      .patch(`/todos/${todos[0]._id}`)
      .send({
        text: 'Wuzgud',
        completed: true
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        Todo.findById(todos[0]._id).then(todo => {
          expect(todo.text).toBe('Wuzgud')
          expect(todo.completed).toBe(true)
          done()
        })
      })
  })
  it('should not update a not found todo id', done => {
    request(app)
      .patch(`/todos/${ObjectID()}`)
      .expect(404)
      .end(done)
  })
  it('should throw an error on invalid todo id', done => {
    request(app)
      .patch(`/todos/abc1231`)
      .expect(404)
      .end(done)
  })
})

describe('/users route', () => {
  it('should create a new user', done => {
    const testEmail = 'test123@gmail.com'
    request(app)
      .post('/users')
      .send({ email: testEmail, password: '123abc' })
      .expect(200)
      .end((err, res) => {
        expect(res.body.email).toBe(testEmail)
        expect(res.body._id).toExist()
        done()
      })
  })
  it('should not create a new user without a password', done => {
    request(app)
      .post('/users')
      .send({ email: '', password: '' })
      .expect(400)
      .end(done)
  })
  it('should return the authenticated user', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        expect(res.body.email).toBe(users[0].email)
        done()
      })
  })
  it('should not return the user without a valid auth token', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', '12312ad')
      .expect(401)
      .end(done)
  })
  it('should return an auth token once the user logs in', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[0].email,
        password: users[0].password
      })
      .expect(200)
      .expect(res => {
        expect(res.body.email).toBe(users[0].email)
        expect(res.header['x-auth']).toExist()
      })
      .end(done)
  })
  it('should delete a user\'s token  with the associated auth token', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        User.findById(users[0]._id).then(user => {
          expect(user.tokens.length).toBe(0)
          done()
        }).catch(e => done(e))
      })
  })
  it('should not delete a user if the token is not valid', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', '123awdq')
      .expect(401)
      .end(done)
  })
})

