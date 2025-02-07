const express = require('express')//making it to use express in this file
const app = express()//setting a constant assigning it to the instance of express
const MongoClient = require('mongodb').MongoClient//makes it possible to use metohds associated with MongoClient and talk to our DB
const PORT = 2121//setting a constant to define the location where our server will be listening.
require('dotenv').config()//allows us to look for access variables inside if the .env file


let db,// declare a variable called db but not assign a value
    dbConnectionStr = process.env.DB_STRING,//declaring a variable and assigning our database connection string to it
    dbName = 'todo'//declaring a variable  and assigning the name of the database we will be using

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })//Creating a connection through to MongoDB, and passing in our connection string. Also passing in an additional property
    .then(client => {//(we only wanna console log the connected when we are actually connected) waiting for the connection and proceeding if successful, and passing in all the client information
        console.log(`Connected to ${dbName} Database`)//log to the console a template literal"connected to todo Database"
        db = client.db(dbName)//assigning a value to previously declared db variable that contains a db client factory method
    })//closing our .then

//middleware(helps facilitate our communication)
app.set('view engine', 'ejs')//sets ejs as the default render method
app.use(express.static('public'))//it sets the location for static assets
app.use(express.urlencoded({ extended: true }))//tells express to decide and encode URLs where the header matches the content. Supports arrays and objects
app.use(express.json())//Parses JSON content from incoming requests (helps us to parse json. It basically replaces body parser)


app.get('/',async (request, response)=>{//starts a GET method when the root route is passed in, sets up req and res parameters
    const todoItems = await db.collection('todos').find().toArray()//sets a variable and awaits ALL items from the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})//sets a variable and awaits a count of uncompleted items to later display in EJS
    response.render('index.ejs', { items: todoItems, left: itemsLeft })//rendering the EJS file and passing through the the db items and the count remaining inside of an object
        
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => {// starts a POST method when the add route is passed in(inside the form we got action->/addTodo which triggers this POST method.)
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})// inserts a new item into todos collection, gives it a completed value of false by default
    .then(result => {//if insert is successful, do something 
        console.log('Todo Added')// console log action
        response.redirect('/')//gets rid of the addTodo route and redirects back to the hompage
    })//closing the .then  
    .catch(error => console.error(error))// catching errors
})// ending the POST

app.put('/markComplete', (request, response) => {//starts a PUT method when the markComplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{//look in the database for one item matching the name  of the item passed in from the main.js that was clicked on
        $set: {
            completed: true//set completed status to true
          }
    },{
        sort: {_id: -1},//moves item to the bottom of the list
        upsert: false// prevents insertion if item does not already exist
    })
    .then(result => {// starting a then if update was successful
        console.log('Marked Complete')// logging successful completion
        response.json('Marked Complete')//sending a response back to the sender
    })//closing then
    .catch(error => console.error(error))// catching errors

})//ending our PUT

app.put('/markUnComplete', (request, response) => {//starts a PUT method when the markUnComplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{//look in the database for one item matching the name  of the item passed in from the main.js that was clicked on
        $set: {
            completed: false//set completed status to false
          }
    },{
        sort: {_id: -1},//moves item to the bottom of the list
        upsert: false// prevents insertion if item does not already exist
    })
    .then(result => {// starting a then if update was successful
        console.log('Marked Complete')// logging successful completion
        response.json('Marked Complete')//sending a response back to the sender
    })//closing then
    .catch(error => console.error(error))// catching errors

})//ending our PUT
// markComplete and markUncomplete could be in the same handler. So its not DRY as possible

app.delete('/deleteItem', (request, response) => {//starts a delete method when the delete route is passed
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})//looks inside the todoes collection for the ONE item that was a matching name from our JS file
    .then(result => {//starts a then if delete was successful
        console.log('Todo Deleted')//logging successful competion
        response.json('Todo Deleted')//sending a response back to the sender
    })//closing then
    .catch(error => console.error(error))// catching errors

})//ending Delete

app.listen(process.env.PORT || PORT, ()=>{//setting up which port we will be listening - either the port from the .env or the port variable we set
    console.log(`Server running on port ${PORT}`)// console.log the running port
})//end the listen 