const convertSyntax = (query) => {
  const {keyword, limit, page, ...filters} = query || {}

  // Prepend `$` range properties {gt,gte,lt,lte} required by mongodb.
  const replaced = JSON.stringify(filters).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)

  return JSON.parse(replaced)
}

const applyFilters = (query) => {
  const filters = convertSyntax(query)
  const page = Number(query?.page || 1)
  const limit = Number(query?.limit || -1)
  const keyword = query?.keyword || ''

  if (keyword) {
    filters['$and'] = keyword.split(' ').map((word) => ({
      name: {
        $regex: word,
        $options: 'i',
      },
    }))
  }

  return {
    filters,
    limit,
    page,
    skip: limit * (page - 1),
  }
}

module.exports = applyFilters
