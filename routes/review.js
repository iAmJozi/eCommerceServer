const express = require('express')
const router = express.Router()

const {getAllReviews, createReview, deleteReview} = require('../controllers/reviewController')
const {withAuth} = require('../middleware/auth')

// Routes.
router.route('/reviews/:id').get(getAllReviews)
router.route('/reviews/create').put(withAuth, createReview)
router.route('/reviews/:id').delete(withAuth, deleteReview)

module.exports = router
