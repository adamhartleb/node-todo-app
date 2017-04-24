const mongoose = require('mongoose')
const { isEmail } = require('validator')
const { sign } = require('jsonwebtoken')

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: isEmail,
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }] 
})

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  const { _id, email } = userObject

  return { _id, email }
}

UserSchema.methods.generateAuthToken = function () {
  const user = this
  const access = 'auth'
  const token = sign({ _id: user._id, access }, 'abc123').toString()

  user.tokens.push({
    access,
    token
  })

  return user.save().then(() => {
    return token
  })
}

exports.User = mongoose.model('User', UserSchema)

