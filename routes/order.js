const express = require('express')
const router = express.Router()

const {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController')
const {withAuth, withUserRole} = require('../middleware/auth')

// Routes.
router.route('/orders/create').post(withAuth, createOrder)
router.route('/orders/:id').get(withAuth, getOrder)
router.route('/orders').get(withAuth, getMyOrders)

// Admin Routes.
router.route('/admin/orders').get(withAuth, withUserRole('admin'), getAllOrders)
router.route('/admin/orders/:id').put(withAuth, withUserRole('admin'), updateOrder)
router.route('/admin/orders/:id').delete(withAuth, withUserRole('admin'), deleteOrder)

module.exports = router
