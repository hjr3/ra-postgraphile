export const mapFilterType = (type: any, value: any, key: string) => {
  if (typeof value === 'object') {
    return {
      [key]: value
    }
  }

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

export const createFilter = (fields: any, type: any) => {
  const empty = [] as object[]
  const filters = Object.keys(fields).reduce((next, key) => {
    const maybeType = type.fields.find((f: any) => f.name === key)
    if (maybeType) {
      const thisType = maybeType.type.ofType || maybeType.type
      return [...next, mapFilterType(thisType, fields[key], key)]
    }
    return next
  }, empty)
  if (filters === empty) {
    return undefined
  }
  return { and: filters }
}
