const cookieOptions = require('../config/cookieOptions')
const filterUserData = require('./filterUserData')

const sendAuthToken = async (user, statusCode, res) => {
  const accessToken = user.signAccessToken()
  const refreshToken = user.signRefreshToken()

  user.refreshToken = refreshToken
  await user.save()

  res.cookie('jwt', refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 7 days.
  })
  res.status(statusCode).json({
    success: true,
    accessToken,
    user: filterUserData(user),
  })
}

module.exports = sendAuthToken
