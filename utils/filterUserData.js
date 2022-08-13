const filterUserData = (user) => {
  return {
    id: user._id || user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    role: user.role,
  }
}

module.exports = filterUserData
