const express = require('express')
const router = express.Router()

const {getReviews, createReview, deleteReview} = require('../controllers/reviewController')
const {withAuth} = require('../middleware/auth')

// Routes.
router.route('/reviews/:productId').get(getReviews)

// Auth Routes.
router.route('/reviews/:productId').put(withAuth, createReview)
router.route('/reviews/:productId').delete(withAuth, deleteReview)

module.exports = router
