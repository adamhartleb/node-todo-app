const { SHA256 } = require('crypto-js')
const { sign, verify } = require('jsonwebtoken')

const data = {
  id: 10
}

const token = sign(data, '123abc')
console.log(verify(token, '123abc'))
