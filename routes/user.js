const express = require('express')
const router = express.Router()

const {
  getMe,
  updateMe,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController')
const {withAuth, withUserRole} = require('../middleware/auth')

// Auth Routes.
router.route('/users/me').get(withAuth, getMe)
router.route('/users/me').put(withAuth, updateMe)

// Admin Routes.
router.route('/users').get(withAuth, withUserRole('admin'), getUsers)
router.route('/users/:id').get(withAuth, withUserRole('admin'), getUser)
router.route('/users/:id').put(withAuth, withUserRole('admin'), updateUser)
router.route('/users/:id').delete(withAuth, withUserRole('admin'), deleteUser)

module.exports = router
