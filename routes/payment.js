const express = require('express')
const router = express.Router()

const {createStripePayment} = require('../controllers/paymentController')
const {withAuth} = require('../middleware/auth')

// Routes.
router.route('/payments/stripe').post(withAuth, createStripePayment)

module.exports = router
