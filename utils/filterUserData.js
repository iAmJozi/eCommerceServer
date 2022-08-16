const filterUserData = (user) => {
  return {
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    role: user.role,
  }
}

module.exports = filterUserData
