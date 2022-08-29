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
 * @desc Get Reviews
 * @route GET /api/v1/reviews/:productId
 * @access public
 */
const getReviews = asyncHandler(async (req, res, next) => {
  const {productId} = req.params
  if (!productId) {
    return next(new ErrorHandler('Product ID is required', STATUS_BAD_REQUEST))
  }

  const populateOptions = {
    path: 'reviews.user',
    select: 'name',
  }
  const foundProduct = await Product.findById(productId).populate(populateOptions).lean().exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  if (!foundProduct?.reviews?.length) {
    return next(new ErrorHandler('Reviews not found', STATUS_NOT_FOUND))
  }

  if (foundProduct?.reviews) {
    foundProduct.reviews = foundProduct.reviews.sort((a, b) => b.createdAt - a.createdAt)
  }

  res.status(STATUS_OK).json({
    success: true,
    reviews: foundProduct.reviews,
  })
})

/**
 * @desc Create Review
 * @route PUT /api/v1/reviews/:productId
 * @access private
 */
const createReview = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const {productId} = req.params
  const {rating, comment} = req.body

  if (!rating || !productId) {
    return next(new ErrorHandler('All fields are required', STATUS_BAD_REQUEST))
  }

  let statusCode = STATUS_OK
  let message = 'Review has been updated'

  const review = {
    user: userId,
    rating: Number(rating),
    comment,
  }

  const foundProduct = await Product.findById(productId).exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  // Check if user has already reviewed the product.
  const hasAlreadyReviewed = foundProduct.reviews.find((r) => {
    return r?.user?.toString() === userId.toString()
  })

  if (hasAlreadyReviewed) {
    foundProduct.reviews.forEach((r) => {
      // Find and update the existing review.
      if (r?.user?.toString() === userId.toString()) {
        r.comment = comment
        r.rating = rating
        r.createdAt = new Date()
      }
    })
  } else {
    statusCode = STATUS_CREATED
    message = 'Review has been created'

    foundProduct.reviews.push(review)
    foundProduct.numOfReviews = foundProduct.reviews.length
  }

  // Sets average ratings.
  foundProduct.ratings =
    foundProduct.reviews.reduce((sum, {rating}) => rating + sum, 0) / foundProduct.reviews.length

  await foundProduct.save({validateBeforeSave: false})

  res.status(statusCode).json({
    success: true,
    message,
  })
})

/**
 * @desc Delete Review
 * @route DELETE /api/v1/reviews/:productId
 * @access private
 */
const deleteReview = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const {productId} = req.params

  const foundProduct = await Product.findById(productId).exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  const reviews = foundProduct.reviews.filter((r) => r.user.toString() !== userId.toString())
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
  getReviews,
  createReview,
  deleteReview,
}
