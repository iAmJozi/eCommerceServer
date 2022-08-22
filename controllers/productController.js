const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler')
const asyncHandler = require('express-async-handler')
const applyFilters = require('../utils/applyFilters')
const {STATUS_NOT_FOUND, STATUS_OK, STATUS_CREATED} = require('../config/statusCodes')

/**
 * @desc Get All Products
 * @route GET /api/v1/products
 * @access public
 */
const getAllProducts = asyncHandler(async (req, res, next) => {
  const {filters, limit, skip, page} = applyFilters(req.query)
  const fields = '_id name price oldPrice author stock images numOfReviews ratings user'

  let foundProducts = []
  if (limit > 0) {
    foundProducts = await Product.find(filters, fields)
      .limit(limit)
      .skip(skip)
      .sort('-createdAt')
      .lean()
      .exec()
  } else {
    foundProducts = await Product.find(filters, fields).sort('-createdAt').lean().exec()
  }
  if (!foundProducts?.length) {
    return next(new ErrorHandler('No product was found', STATUS_NOT_FOUND))
  }

  const totalProducts = await Product.countDocuments(filters).lean().exec()

  res.status(STATUS_OK).json({
    success: true,
    page,
    limit: limit > 0 ? limit : totalProducts,
    total: totalProducts,
    found: foundProducts.length,
    pages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
    products: foundProducts,
  })
})

/**
 * @desc Get Product
 * @route GET /api/v1/products/:id
 * @access public
 */
const getProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id
  const userPopulate = {
    path: 'user reviews.user',
    select: 'name',
  }
  const foundProduct = await Product.findById(productId).populate(userPopulate).lean().exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  if (foundProduct?.reviews) {
    foundProduct.reviews = foundProduct.reviews.sort((a, b) => b.createdAt - a.createdAt)
  }

  res.status(STATUS_OK).json({
    success: true,
    product: foundProduct,
  })
})

/**
 * @desc Create Product
 * @route PUT /api/v1/products/create
 * @access private
 */
const createProduct = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id // pass logged user id as product user reference.

  const createdProduct = await Product.create(req.body)

  res.status(STATUS_CREATED).json({
    success: true,
    product: createdProduct,
  })
})

/**
 * @desc Update Product
 * @route PUT /api/v1/products/:id
 * @access private
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id
  await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(STATUS_OK).json({
    success: true,
    message: 'Product was updated',
  })
})

/**
 * @desc Delete Product
 * @route DELETE /api/v1/products/:id
 * @access private
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id
  const foundProduct = await Product.findById(productId).exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  await foundProduct.remove()

  res.status(STATUS_OK).json({
    success: true,
    message: `Product (${productId}) was deleted`,
  })
})

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
}
