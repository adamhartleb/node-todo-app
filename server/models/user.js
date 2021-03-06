const mongoose = require('mongoose')
const { isEmail } = require('validator')
const { sign, verify } = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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

UserSchema.pre('save', function (next) {
  const user = this

  if (user.isModified('password')) {
     bcrypt.genSalt(10, (err, salt) => {
       bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded

  try {
    decoded = verify(token, 'abc123')
  } catch (e) {
    return Promise.reject()
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this

  return User.findOne({ email }).then(user => {
    if (!user) return Promise.reject()
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user)
        } else {
          reject()
        }
      })
    })
  })
}

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

UserSchema.methods.removeToken = function (token) {
  const user = this

  return user.update({
    $pull: {
      tokens: { token }
    }
  })
}

exports.User = mongoose.model('User', UserSchema)

