const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler')
const asyncHandler = require('express-async-handler')
const applyFilters = require('../utils/applyFilters')
const cloudinary = require('cloudinary')
const {STATUS_NOT_FOUND, STATUS_OK, STATUS_CREATED} = require('../config/statusCodes')

/**
 * @desc Get Products
 * @route GET /api/v1/products
 * @access public
 */
const getProducts = asyncHandler(async (req, res, next) => {
  const {filters, limit, skip, page} = applyFilters(req.query)
  const filteredFields = '_id name price oldPrice author stock images numOfReviews ratings user'

  let foundProducts = []
  if (limit > 0) {
    foundProducts = await Product.find(filters, filteredFields)
      .limit(limit)
      .skip(skip)
      .sort('-createdAt')
      .lean()
      .exec()
  } else {
    foundProducts = await Product.find(filters, filteredFields).sort('-createdAt').lean().exec()
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
  const {id} = req.params
  const populateOptions = {
    path: 'user reviews.user',
    select: 'name',
  }
  const foundProduct = await Product.findById(id).populate(populateOptions).lean().exec()
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
 * @route PUT /api/v1/products
 * @access private
 */
const createProduct = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  req.body.user = userId
  const {images = [], ...data} = req.body || {}

  const imagesList = typeof images === 'string' ? [images] : images
  let newImages = []

  for (let i = 0; i < imagesList.length; i++) {
    const image = JSON.parse(imagesList[i])
    const result = await cloudinary.v2.uploader.upload(image, {
      folder: 'Products',
    })

    newImages.push({
      public_id: result.public_id,
      url: result.secure_url,
    })
  }

  data.images = newImages

  await Product.create(data)

  res.status(STATUS_CREATED).json({
    success: true,
    message: 'Product was created',
  })
})

/**
 * @desc Update Product
 * @route PUT /api/v1/products/:id
 * @access private
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  const {id} = req.params
  const {images = [], deletedImages = [], ...data} = req.body || {}

  const foundProduct = await Product.findById(id).lean().exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  const imagesList = typeof images === 'string' ? [images] : images
  let newImages = []

  for (let i = 0; i < imagesList.length; i++) {
    const image = JSON.parse(imagesList[i])
    const isNewImage = typeof image === 'string'

    if (isNewImage) {
      const result = await cloudinary.v2.uploader.upload(image, {
        folder: 'Products',
      })

      newImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      })
    } else {
      newImages.push(image)
    }
  }

  const deletedImagesList = typeof deletedImages === 'string' ? [deletedImages] : deletedImages
  for (let i = 0; i < deletedImagesList.length; i++) {
    const public_id = deletedImagesList[i]

    await cloudinary.v2.uploader.destroy(public_id)
  }

  data.images = newImages

  await Product.findByIdAndUpdate(id, data, {
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
  const {id} = req.params
  const foundProduct = await Product.findById(id).exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  const images = foundProduct.images || []
  for (let i = 0; i < images.length; i++) {
    const {public_id} = images[i]

    await cloudinary.v2.uploader.destroy(public_id)
  }

  await foundProduct.remove()

  res.status(STATUS_OK).json({
    success: true,
    message: `Product (${id}) was deleted`,
  })
})

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
}
