const express = require('express')
const router = express.Router()

const {
  getProducts,
  getProduct,
  updateProduct,
  createProduct,
  deleteProduct,
} = require('../controllers/productController')
const {withAuth, withUserRole} = require('../middleware/auth')

// Routes.
router.route('/products').get(getProducts)
router.route('/products/:id').get(getProduct)

// Admin Routes.
router.route('/products').post(withAuth, withUserRole('admin'), createProduct)
router.route('/products/:id').put(withAuth, withUserRole('admin'), updateProduct)
router.route('/products/:id').delete(withAuth, withUserRole('admin'), deleteProduct)

module.exports = router
