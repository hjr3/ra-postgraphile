'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.mapFilterType = (type, value, key) => {
  const normalizedName = type.name.toLowerCase()
  switch (normalizedName) {
    case 'string':
      return {
        or: [
          {
            [key]: {
              equalTo: value
            }
          },
          {
            [key]: {
              like: `%${value}%`
            }
          }
        ]
      }
    case 'uuid':
    case 'bigint':
    case 'int':
      return Array.isArray(value)
        ? {
            [key]: {
              in: value
            }
          }
        : {
            [key]: {
              equalTo: value
            }
          }
    default:
      throw new Error(`Filter for type ${type.name} not implemented.`)
  }
}
exports.createFilter = (fields, type) => {
  const empty = []
  const filters = Object.keys(fields).reduce((next, key) => {
    const maybeType = type.fields.find(f => f.name === key)
    if (maybeType) {
      const thisType = maybeType.type.ofType || maybeType.type
      return [...next, exports.mapFilterType(thisType, fields[key], key)]
    }
    return next
  }, empty)
  if (filters === empty) {
    return undefined
  }
  return { and: filters }
}
