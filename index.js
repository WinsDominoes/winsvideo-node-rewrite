/*
Main file for WinsVideo
*/

const express = require('express')
const router = require('./routes/Router')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const rand = require('random-id')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const config = require('./config.json')

console.log('Starting WinsVideo...')

/*
Initialize our Database
*/
const DB = require('./Database')

const Database = new DB(config.dbInfo)

/*
Express Setup
*/

const app = express()

// Sessions
const sessionId = rand(30, 'aA0')
app.use(session({ resave: true, saveUninitialized: true, secret: sessionId, expires: new Date(Date.now() + (30 * 86400 * 1000)) }))

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(fileUpload({
  createParentPath: true
}))

// Router
app.use('/api', router.API(Database))
app.use('/upload', router.Upload)
app.use('/', router.Base) // Include our Base router last since this handles errors

// Start Express
const port = process.env.PORT || config.webserver.port || 3000
app.listen(port, () => {
  console.log(`WinsVideo is listening on port ${port}.`)
})
