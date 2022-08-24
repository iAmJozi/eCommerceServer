const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/errorHandler')
const fileUpload = require('express-fileupload')
const corsOptions = require('./config/corsOptions')
const credentials = require('./middleware/credentials')
const {logger} = require('./middleware/logger')

// Use Middlewares.
app.use(logger)
app.use(fileUpload())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(credentials)
app.use(cors(corsOptions))

// Import All Routes.
const auth = require('./routes/auth')
const user = require('./routes/user')
const products = require('./routes/product')
const payment = require('./routes/payment')
const review = require('./routes/review')
const order = require('./routes/order')

// Use API v1.
app.use('/api/v1', auth)
app.use('/api/v1', user)
app.use('/api/v1', products)
app.use('/api/v1', payment)
app.use('/api/v1', review)
app.use('/api/v1', order)

// Use Error Handler middleware.
app.use(errorHandler)

module.exports = app
