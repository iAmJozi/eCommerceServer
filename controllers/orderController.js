const Order = require('../models/order')
const ErrorHandler = require('../utils/errorHandler')
const asyncHandler = require('express-async-handler')
const updateStock = require('../utils/updateStock')
const {
  STATUS_CREATED,
  STATUS_NOT_FOUND,
  STATUS_OK,
  STATUS_BAD_REQUEST,
} = require('../config/statusCodes')

/**
 * @desc Create Order
 * @route POST /api/v1/orders/create
 * @access private
 */
const createOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user._id
  const {orderItems, shippingInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, paymentInfo} =
    req.body

  const createdOrder = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: userId,
  })

  createdOrder.orderItems.forEach(async ({product, amount}) => {
    await updateStock(product, amount)
  })

  res.status(STATUS_CREATED).json({
    success: true,
    order: createdOrder,
  })
})

/**
 * @desc Get Order
 * @route GET /api/v1/orders/:id
 * @access private
 */
const getOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id
  const foundOrder = await Order.findById(orderId).populate('user', 'name email').lean().exec()

  if (!foundOrder) {
    return next(new ErrorHandler('Order was not found', STATUS_NOT_FOUND))
  }

  res.status(STATUS_OK).json({
    success: true,
    order: foundOrder,
  })
})

/**
 * @desc Get My Orders
 * @route GET /api/v1/orders
 * @access private
 */
const getMyOrders = asyncHandler(async (req, res, next) => {
  const userId = req.user.id
  const myOrders = await Order.find({user: userId}).lean().exec()
  if (!myOrders?.length) {
    return next(new ErrorHandler('No order was found', STATUS_NOT_FOUND))
  }

  res.status(STATUS_OK).json({
    success: true,
    found: myOrders.length,
    orders: myOrders,
  })
})

/**
 * @desc Get All Orders
 * @route GET /api/v1/admin/orders
 * @access private
 */
const getAllOrders = asyncHandler(async (req, res, next) => {
  const allOrders = await Order.find().lean().exec()
  if (!allOrders?.length) {
    return next(new ErrorHandler('No order was found', STATUS_NOT_FOUND))
  }

  res.status(STATUS_OK).json({
    success: true,
    found: allOrders.length,
    orders: allOrders,
  })
})

/**
 * @desc Update Order
 * @route PUT /api/v1/admin/orders/:id
 * @access private
 */
const updateOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id
  const foundOrder = await Order.findById(orderId).exec()

  // if (foundOrder.orderStatus === 'Delivered') {
  //   return next(new ErrorHandler('Already delivered this order', STATUS_BAD_REQUEST))
  // }

  foundOrder.orderStatus = req.body.orderStatus
  foundOrder.delivered = Date.now()

  await foundOrder.save()

  res.status(STATUS_OK).json({
    success: true,
    message: 'Order has been updated',
  })
})

/**
 * @desc Delete Order
 * @route DELETE /api/v1/admin/orders/:id
 * @access private
 */
const deleteOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id
  const foundOrder = await Order.findById(orderId).exec()
  if (!foundOrder) {
    return next(new ErrorHandler('No order found with this ID', STATUS_NOT_FOUND))
  }

  foundOrder.orderItems.forEach(async ({product, amount}) => {
    await updateStock(product, -Math.abs(amount))
  })
  await foundOrder.remove()

  res.status(STATUS_OK).json({
    success: true,
    message: `Order (${orderId}) has been deleted`,
  })
})

module.exports = {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
}
