const express = require('express')
const router = express.Router()

const {
  getOrders,
  getOrder,
  getMyOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController')
const {withAuth, withUserRole} = require('../middleware/auth')

// Auth Routes.
router.route('/me/orders').get(withAuth, getMyOrders)
router.route('/orders/:id').get(withAuth, getOrder)
router.route('/orders').post(withAuth, createOrder)

// Admin Routes.
router.route('/orders').get(withAuth, withUserRole('admin'), getOrders)
router.route('/orders/:id').put(withAuth, withUserRole('admin'), updateOrder)
router.route('/orders/:id').delete(withAuth, withUserRole('admin'), deleteOrder)

module.exports = router
