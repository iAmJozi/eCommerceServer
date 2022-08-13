const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, {origin: true})
    } else {
      callback(new Error('Blocked by CORS'))
    }
  },
  // preflightContinue: true,
  credentials: true,
  optionsSuccessStatus: 200,
}

module.exports = corsOptions
