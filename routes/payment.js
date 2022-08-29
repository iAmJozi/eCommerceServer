const express = require('express')
const router = express.Router()

const {connectStripe} = require('../controllers/paymentController')
const {withAuth} = require('../middleware/auth')

// Auth Routes.
router.route('/payments/stripe').post(withAuth, connectStripe)

module.exports = router
