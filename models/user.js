const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      maxlength: 30,
      minlength: 3,
    },
    name: {
      type: String,
      required: true,
      maxlength: 30,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: validator.isEmail,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      default: 'user',
    },
    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpiration: String,
  },
  {timestamps: true}
)

// Encrypts user password before saving to database.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  this.password = await bcrypt.hash(this.password, 10) // 10 rounds.
})

// Compares given password with user's database password.
userSchema.methods.comparePassword = async function (password) {
  const databasePassword = this.password

  return await bcrypt.compare(password, databasePassword)
}

// Sings access token for the logged user.
userSchema.methods.signAccessToken = function () {
  return jwt.sign({id: this._id}, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: '1800s', // 30 minutes.
  })
}

// Sings refresh token for the logged user.
userSchema.methods.signRefreshToken = function () {
  return jwt.sign({id: this._id}, process.env.JWT_REFRESH_TOKEN_SECRET, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days.
  })
}

// Sings reset password token.
userSchema.methods.signResetPasswordToken = function () {
  const resetPasswordToken = crypto.randomBytes(20).toString('hex')
  const hashedResetPasswordToken = crypto
    .createHash('sha256')
    .update(resetPasswordToken)
    .digest('hex')
  const expirationTime = Date.now() + 30 * 60 * 1000 // 30 minutes.

  // Store reset password token and expiration to the userSchema.
  this.resetPasswordToken = hashedResetPasswordToken
  this.resetPasswordExpiration = expirationTime

  return resetPasswordToken
}

module.exports = mongoose.model('User', userSchema)
