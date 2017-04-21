const mongoose = require('mongoose')

exports.User = mongoose.model('User', {
  email: {
    type: String,
    trim: true,
    minlength: 1
  }
})

