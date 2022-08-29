const express = require('express')
const router = express.Router()

const {
  loginHandler,
  registerHandler,
  logoutHandler,
  forgotPassword,
  resetPassword,
  updatePassword,
  getNewAccessToken,
} = require('../controllers/authController')
const {withoutAuth, withAuth} = require('../middleware/auth')

// Routes.
router.route('/auth/logout').post(logoutHandler)

// Guest Routes.
router.route('/auth/reset/:token').put(withoutAuth, resetPassword)
router.route('/auth/forgot').post(withoutAuth, forgotPassword)
router.route('/auth/register').post(withoutAuth, registerHandler)
router.route('/auth/login').post(withoutAuth, loginHandler)

// Auth Routes.
router.route('/auth/password').put(withAuth, updatePassword)
router.route('/auth/refresh').get(getNewAccessToken)

module.exports = router
