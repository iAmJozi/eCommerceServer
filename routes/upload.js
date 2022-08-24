const express = require('express')
const router = express.Router()

const {uploadImages} = require('../controllers/uploadController')
const {withAuth, withUserRole} = require('../middleware/auth')

// Admin Routes.
router.route('/admin/upload/:id').post(withAuth, withUserRole('admin'), uploadImages)

module.exports = router
