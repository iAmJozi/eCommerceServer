const express = require('express')
const router = express.Router()

const {
  getLoggedUser,
  updateLoggedUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController')
const {withAuth, withUserRole} = require('../middleware/auth')

// Routes.
router.route('/users/me').get(withAuth, getLoggedUser)
router.route('/users/me').put(withAuth, updateLoggedUser)

// Admin Routes.
router.route('/admin/users').get(withAuth, withUserRole('admin'), getAllUsers)
router.route('/admin/users/:id').get(withAuth, withUserRole('admin'), getUser)
router.route('/admin/users/:id').put(withAuth, withUserRole('admin'), updateUser)
router.route('/admin/users/:id').delete(withAuth, withUserRole('admin'), deleteUser)

module.exports = router
