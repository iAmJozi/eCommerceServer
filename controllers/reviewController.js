const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler')
const asyncHandler = require('express-async-handler')
const {
  STATUS_BAD_REQUEST,
  STATUS_NOT_FOUND,
  STATUS_OK,
  STATUS_CREATED,
} = require('../config/statusCodes')

/**
 * @desc Get All Reviews
 * @route GET /api/v1/reviews/:id
 * @access public
 */
const getAllReviews = asyncHandler(async (req, res, next) => {
  const productId = req.params.id
  if (!productId) {
    return next(new ErrorHandler('Product ID is required', STATUS_BAD_REQUEST))
  }

  const userPopulate = {
    path: 'reviews.user',
    select: 'name',
  }
  const foundProduct = await Product.findById(productId).populate(userPopulate).lean().exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  if (!foundProduct?.reviews?.length) {
    return next(new ErrorHandler('Reviews not found', STATUS_NOT_FOUND))
  }

  res.status(STATUS_OK).json({
    success: true,
    reviews: foundProduct.reviews,
  })
})

/**
 * @desc Create Review
 * @route PUT /api/v1/reviews/create
 * @access private
 */
const createReview = asyncHandler(async (req, res, next) => {
  const {rating, comment, productId} = req.body
  if (!rating || !productId) {
    return next(new ErrorHandler('All fields are required', STATUS_BAD_REQUEST))
  }

  const {_id: user} = req.user
  let statusCode = STATUS_OK
  const review = {
    user,
    rating: Number(rating),
    comment,
  }

  const foundProduct = await Product.findById(productId).exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  // Check if user has already reviewed the product.
  const hasUserReview = foundProduct.reviews.find((r) => {
    return r?.user?.toString() === user.toString()
  })

  if (hasUserReview) {
    foundProduct.reviews.forEach((r) => {
      if (r?.user?.toString() === user.toString()) {
        r.comment = comment
        r.rating = rating
        r.createdAt = new Date()
      }
    })
  } else {
    statusCode = STATUS_CREATED

    foundProduct.reviews.push(review)
    foundProduct.numOfReviews = foundProduct.reviews.length
  }

  // Sets average ratings.
  foundProduct.ratings =
    foundProduct.reviews.reduce((sum, {rating}) => rating + sum, 0) / foundProduct.reviews.length

  await foundProduct.save({validateBeforeSave: false})

  res.status(statusCode).json({
    success: true,
    message: statusCode === STATUS_OK ? 'Review has been updated' : 'Review has been created',
  })
})

/**
 * @desc Delete Review
 * @route DELETE /api/v1/reviews/:id
 * @access private
 */
const deleteReview = asyncHandler(async (req, res, next) => {
  const productId = req.params.id
  const {_id: user} = req.user
  const foundProduct = await Product.findById(productId).exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  const reviews = foundProduct.reviews.filter((r) => r.user.toString() !== user.toString())
  const numOfReviews = reviews.length
  const ratings = foundProduct.reviews.reduce((sum, {rating}) => rating + sum, 0) / reviews.length

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {new: true, runValidators: true, useFindAndModify: false}
  )

  res.status(STATUS_OK).json({
    success: true,
    message: 'Review has been deleted',
  })
})

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
}
