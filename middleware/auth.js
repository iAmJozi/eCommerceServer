const jwt = require('jsonwebtoken')
const ErrorHandler = require('../utils/errorHandler')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const {STATUS_INTERNAL, STATUS_UNAUTHORIZED, STATUS_FORBIDDEN} = require('../config/statusCodes')

const withoutAuth = asyncHandler(async (req, res, next) => {
  const {jwt: refreshToken} = req.cookies
  if (!refreshToken) {
    return next()
  }
  return next(new ErrorHandler('Already Logged In', STATUS_INTERNAL))
})

const withAuth = asyncHandler(async (req, res, next) => {
  // const {jwt: refreshToken} = req.cookies
  // jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async (err, decoded) => {
  //   if (err) {
  //     return next(new ErrorHandler('Access Denied', STATUS_FORBIDDEN))
  //   }

  //   const decodedUserId = decoded.id.toString()
  //   req.user = await User.findById(decodedUserId)

  //   next()
  // })

  const {jwt: refreshToken} = req.cookies
  if (!refreshToken) {
    return next(new ErrorHandler('Not allowed', STATUS_UNAUTHORIZED))
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (!authHeader) {
    return next(new ErrorHandler('Not allowed', STATUS_FORBIDDEN))
  }

  const accessToken = authHeader.split(' ')[1]
  jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return next(new ErrorHandler('Expired access token', STATUS_FORBIDDEN))
    }

    const decodedUserId = decoded.id.toString()
    req.user = await User.findById(decodedUserId)

    next()
  })
})

const withUserRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req?.user?.role)) {
      return next(new ErrorHandler(`Access denied (role: ${req.user.role})`, STATUS_FORBIDDEN))
    }
    next()
  }
}

module.exports = {
  withoutAuth,
  withAuth,
  withUserRole,
}
