const asyncHandler = require('express-async-handler')
const {STATUS_OK} = require('../config/statusCodes')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

/**
 * @desc Connect Stripe
 * @route POST /api/v1/payments/stripe
 * @access private
 */
const connectStripe = asyncHandler(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'usd',
    metadata: {
      integration_check: 'accept_a_payment',
    },
  })

  res.status(STATUS_OK).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  })
})

module.exports = {
  connectStripe,
}
