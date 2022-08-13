const express = require('express')
const router = express.Router()

const {
  getAllProducts,
  getProduct,
  updateProduct,
  createProduct,
  deleteProduct,
} = require('../controllers/productController')
const {withAuth, withUserRole} = require('../middleware/auth')

// Routes.
router.route('/products').get(getAllProducts)
router.route('/products/:id').get(getProduct)

// Admin Routes.
router.route('/admin/products/:id').put(withAuth, withUserRole('admin'), updateProduct)
router.route('/admin/products/:id').delete(withAuth, withUserRole('admin'), deleteProduct)
router.route('/admin/products/create').post(withAuth, withUserRole('admin'), createProduct)

module.exports = router
