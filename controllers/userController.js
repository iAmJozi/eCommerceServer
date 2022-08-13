const User = require('../models/user')
const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler')
const asyncHandler = require('express-async-handler')
const filterUserData = require('../utils/filterUserData')
const {
  STATUS_OK,
  STATUS_BAD_REQUEST,
  STATUS_NOT_FOUND,
  STATUS_CONFLICT,
} = require('../config/statusCodes')

/**
 * @desc Get Logged User
 * @route GET /api/v1/users/me
 * @access private
 */
const getLoggedUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id // passed by `withAuth` middleware.
  const foundUser = await User.findById(userId).lean().exec()

  res.status(STATUS_OK).json({
    success: true,
    user: filterUserData(foundUser),
  })
})

/**
 * @desc Update Logged User
 * @route PUT /api/v1/users/me
 * @access private
 */
const updateLoggedUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const {name, email} = req.body
  if (!name || !email) {
    return next(new ErrorHandler('All fields are required', STATUS_BAD_REQUEST))
  }

  const foundUser = await User.findById(userId).exec()
  if (!foundUser) {
    return next(new ErrorHandler('User not found', STATUS_NOT_FOUND))
  }

  const duplicatedUser = await User.findOne({email: {$regex: email, $options: 'i'}})
    .lean()
    .exec()
  if (duplicatedUser && duplicatedUser?._id.toString() !== userId) {
    return next(new ErrorHandler('This email is already registered', STATUS_CONFLICT))
  }

  foundUser.name = name
  foundUser.email = email

  await foundUser.save()

  res.status(STATUS_OK).json({
    success: true,
    message: 'Profile has been updated',
  })
})

/**
 * @desc Get User
 * @route GET /api/v1/users/:id
 * @access private
 */
const getUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id
  const foundUser = await User.findById(userId).lean().exec()
  if (!foundUser) {
    return next(new ErrorHandler(`User (${userId}) not found`, STATUS_NOT_FOUND))
  }

  res.status(STATUS_OK).json({
    success: true,
    user: filterUserData(foundUser),
  })
})

/**
 * @desc Update User
 * @route PUT /api/v1/admin/users/:id
 * @access private
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id
  const {name, email, role} = req.body
  if (!name || !email || !role) {
    return next(new ErrorHandler('All fields are required', STATUS_BAD_REQUEST))
  }

  const foundUser = await User.findById(userId).exec()
  if (!foundUser) {
    return next(new ErrorHandler('User not found', STATUS_NOT_FOUND))
  }

  const duplicatedUser = await User.findOne({email: {$regex: email, $options: 'i'}})
    .lean()
    .exec()
  if (duplicatedUser && duplicatedUser?._id.toString() !== userId) {
    return next(new ErrorHandler('This email is already registered', STATUS_CONFLICT))
  }

  foundUser.name = name
  foundUser.email = email
  foundUser.role = role

  const updatedUser = await foundUser.save()

  res.status(STATUS_OK).json({
    success: true,
    message: `User (${updatedUser.username}) has been updated`,
  })
})

/**
 * @desc Delete User
 * @route DELETE /api/v1/admin/users/:id
 * @access private
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id
  const userProducts = await Product.countDocuments({user: userId}).lean().exec()
  if (userProducts) {
    return next(new ErrorHandler(`User has assigned ${userProducts} products`, STATUS_BAD_REQUEST))
  }

  const foundUser = await User.findById(userId).exec()
  if (!foundUser) {
    return next(new ErrorHandler(`User (${userId}) not found`, STATUS_NOT_FOUND))
  }

  const deletedUser = await foundUser.deleteOne()

  res.status(STATUS_OK).json({
    success: true,
    message: `User (${deletedUser.name}/${deletedUser.email}) was deleted`,
  })
})

/**
 * @desc Get All Users
 * @route GET /api/v1/admin/users
 * @access private
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find().lean().exec()
  if (!allUsers?.length) {
    return next(new ErrorHandler('No user was found', STATUS_NOT_FOUND))
  }

  res.status(STATUS_OK).json({
    success: true,
    found: allUsers.length,
    users: allUsers.map(filterUserData),
  })
})

module.exports = {
  getLoggedUser,
  updateLoggedUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
}
