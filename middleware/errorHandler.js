const ErrorHandler = require('../utils/errorHandler')
const {logEvents} = require('./logger')

const errorHandler = (err, req, res, next) => {
  const defaultStatusCode = err.statusCode || 400
  const defaultMessage = 'Internal Server Error'
  let error = {...err}

  // Mongoose Object Id Error.
  if (err.name === 'CastError') {
    error = new ErrorHandler(`Invalid document ID`, 400) // (${err.path})
  }

  // Mongoose Validation Error.
  if (err.name === 'ValidationError') {
    error = new ErrorHandler(
      `Invalid (${Object.values(err.errors)
        .map(({path}) => path)
        .join(', ')})`,
      400
    )
  }

  // Mongoose duplicate key errors.
  if (err.code === 11000) {
    error = new ErrorHandler(`Duplicated ${Object.keys(err.keyValue)} entered`, 409)
  }

  // Json Web Token Error.
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorHandler('Invalid Access Token', 400)
  }

  // Json Web Token Expiration Error.
  if (err.name === 'TokenExpiredError') {
    error = new ErrorHandler('Expired Access Token', 400)
  }

  const message = error.message ?? err.message ?? defaultMessage
  const statusCode = err.statusCode ?? defaultStatusCode

  // Log error.
  logEvents(`${err.name}: ${message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'err')

  // Send error response.
  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = errorHandler
