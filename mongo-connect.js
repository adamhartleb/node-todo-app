const { MongoClient, ObjectID } = require('mongodb')
const url = 'mongodb://localhost:27017/TodoApp'

MongoClient.connect(url, (err, db) => {
  if (err) return console.log(err)
  db.collection('Todos').findOneAndUpdate({ _id: new ObjectID('58fa4afb5dab1bb69c44996e') }
    , { $set: { completed: true } }
    , { returnOriginal: false }
  ).then(result => console.log(result))

  db.close()
})