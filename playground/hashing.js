const { SHA256 } = require('crypto-js')
const { sign, verify } = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const password = '123abc'

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    
  })
})

const data = {
  id: 10
}

const token = sign(data, '123abc')
console.log(verify(token, '123abc'))
