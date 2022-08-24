const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler')
const asyncHandler = require('express-async-handler')
const cloudinary = require('cloudinary')
const {STATUS_CREATED, STATUS_NOT_FOUND, STATUS_BAD_REQUEST} = require('../config/statusCodes')

/**
 * @desc Create Product
 * @route PUT /api/v1/products/create
 * @access private
 */
const uploadImages = asyncHandler(async (req, res, next) => {
  const productId = req.params.id
  const files = req?.files
  if (!files) {
    return next(new ErrorHandler('No file uploaded', STATUS_BAD_REQUEST))
  }

  const foundProduct = await Product.findById(productId, 'images').exec()
  if (!foundProduct) {
    return next(new ErrorHandler('Product not found', STATUS_NOT_FOUND))
  }

  const uploadedFiles = []
  const arrayFiles = files.file.length ? files.file : [files.file]
  for (let i = 0; i < arrayFiles.length; i++) {
    const file = arrayFiles[i]

    const result = await cloudinary.v2.uploader.upload(file, {
      folder: 'Products',
    })

    uploadedFiles.push({
      public_id: result.public_id,
      url: result.secure_url,
    })
  }

  if (uploadedFiles.length) {
    if (foundProduct?.images.length) {
      foundProduct.images = [...foundProduct?.images, ...uploadedFiles]
    } else {
      foundProduct.images = uploadedFiles
    }

    await foundProduct.save()
  }

  console.log(foundProduct?.images)

  res.status(STATUS_CREATED).json({
    success: true,
    message: 'Images were uploaded',
  })
})

module.exports = {
  uploadImages,
}
