const express = require('express')
const router = express.Router()

const {
  loginHandler,
  registerHandler,
  logoutHandler,
  recoverPassword,
  resetPassword,
  updatePassword,
  getNewAccessToken,
} = require('../controllers/authController')
const {withoutAuth, withAuth} = require('../middleware/auth')

// Routes.
router.route('/auth/login').post(withoutAuth, loginHandler)
router.route('/auth/register').post(withoutAuth, registerHandler)
router.route('/auth/password/recover').post(withoutAuth, recoverPassword)
router.route('/auth/password/reset/:token').put(withoutAuth, resetPassword)
router.route('/auth/logout').get(logoutHandler)
router.route('/auth/refresh').get(getNewAccessToken)
router.route('/auth/password').put(withAuth, updatePassword)

module.exports = router
