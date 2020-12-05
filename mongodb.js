// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// const ObjectID = mongodb.ObjectID

// ---------------------
// not connected to anything else in the project
// ---------------------

const { MongoClient, ObjectID } = require('mongodb') // destructure way

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// const id = new ObjectID()
// console.log(id)

MongoClient.connect(connectionURL, { useUnifiedTopology: true, useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!')
    }

    const db = client.db(databaseName)

    // db.collection('users').deleteMany({
    //     age: 27
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    db.collection('tasks').deleteOne({
        description: "Get a haircut"
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })


    // <create>
    // insertOne
    // insertMany
    // result.ops
    // <read>
    // findOne
    // find (for multiple).toArray
    // <update>
    // updateOne (using update operator)
    // updateMany
})