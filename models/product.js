const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxlength: [100, 'Please a shorter product name'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxlength: [5, 'Please enter a shorter product price'],
      default: 0.0,
    },
    oldPrice: {
      type: Number,
      required: false,
      maxlength: [5, 'Please enter a shorter product old price'],
      default: 0.0,
    },
    excerpt: {
      type: String,
      required: [true, 'Please enter product excerpt'],
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, 'Please select product category'],
      enum: {
        values: ['Chair', 'Lamp', 'Drawer', 'Table', 'Clock'],
        message: 'Please select correct product category',
      },
    },
    seller: {
      type: String,
      required: [true, 'Please enter product seller'],
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      maxlength: [5, 'Please enter a lower value'],
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {timestamps: true}
)

module.exports = mongoose.model('Product', productSchema)
