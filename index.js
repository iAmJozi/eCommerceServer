const dotenv = require('dotenv')
const app = require('./app')
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary')

// Handle Uncaught exceptions.
process.on('uncaughtException', (err) => {
  console.log(`ERROR: ${err.stack}`)
  console.log('Shutting down server due to uncaught exceptions')

  process.exit(1)
})

// Setting up config file.
dotenv.config({
  path: '.env',
})

// Connect with database.
connectDatabase()

// Setting up cloudinary config.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const server = app.listen(process.env.PORT, () => {
  console.log(`Server listening on port: ${process.env.PORT} in ${process.env.NODE_ENV}`)
})

// Handle Unhandled Promise rejections.
process.on('unhandledRejection', (err) => {
  console.log(`ERROR: ${err.message}`)
  console.log('Shutting down server due to Unhandled Promise rejection')

  server.close(() => {
    process.exit(1)
  })
})
