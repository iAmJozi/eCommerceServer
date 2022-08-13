const Product = require('../models/product')

const updateStock = async (id, amount) => {
  const product = await Product.findById(id)
  product.stock = product.stock - amount

  await product.save({validateBeforeSave: false})
}

module.exports = updateStock
