const jwt = require('jsonwebtoken')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('./catchAsyncErrors')
const User = require('../models/user')

exports.withoutAuth = catchAsyncErrors(async (req, res, next) => {
  const {jwt: refreshToken} = req.cookies
  if (!refreshToken) {
    return next()
  }
  return next(new ErrorHandler('Already Logged In', 500))
})

exports.withAuth = catchAsyncErrors(async (req, res, next) => {
  // jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async (err, decoded) => {
  //   if (err) {
  //     return next(new ErrorHandler('Access Denied', 403))
  //   }
  //
  //   const decodedUserId = decoded.id.toString()
  //   req.user = await User.findById(decodedUserId)
  //
  //   next()
  // })

  const {jwt: refreshToken} = req.cookies
  if (!refreshToken) {
    return next(new ErrorHandler('Not allowed', 401))
  }

  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return next(new ErrorHandler('Not allowed', 401))
  }

  const accessToken = authHeader.split(' ')[1]
  jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return next(new ErrorHandler('Access denied', 403))
    }

    const decodedUserId = decoded.id.toString()
    req.user = await User.findById(decodedUserId)

    next()
  })
})

// Checks User role.
exports.withUserRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req?.user?.role)) {
      return next(new ErrorHandler(`Access denied (role: ${req.user.role})`, 403))
    }

    next()
  }
}
