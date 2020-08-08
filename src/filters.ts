import {
  IntrospectionResource,
  FieldType,
  Filter,
  FilterMap,
  FilterSpec,
  Operator
} from './types'

/**
 * Transforms for a certain field type a search value for a field (the key)
 * to a filter that is understood by postgraphile.
 *
 * For example:
 *
 * - type: {kind: "SCALAR", name: "String", ofType: null, __typename: "__Type"}
 * - value: "some keyword"
 * - key: "name"
 *
 * Is transformed to:
 *
 * ```ts
 * {
 *   name: {
 *     includes: "some keyword"
 *   }
 * }
 * ```
 */
export const mapFilterType = (
  type: FieldType,
  value: any,
  key: string
): Filter => {
  if (Array.isArray(value)) {
    const spec: FilterSpec = {
      operator: 'in',
      value
    }

    value = spec
  }

  if (typeof value !== 'object') {
    const typeName = (type?.name ?? '').toLowerCase()

    let operator: Operator = 'equalTo'
    // string uses includes a the default operator for historical reasons
    if (typeName === 'string') {
      operator = 'includes'
    }

    // a type of FullText uses matches a the default operator for historical reasons
    if (typeName === 'fulltext') {
      operator = 'matches'
      value = `${value}:*`
    }

    // a type of UUID uses matches a the default operator for historical reasons
    if (typeName === 'uuid') {
      operator = 'equalTo'
    }

    const spec: FilterSpec = {
      operator,
      value
    }

    value = spec
  } else {
    // make sure object has a shape of FilterSpec
    if (value?.operator === undefined || value?.value === undefined) {
      throw new Error(
        `Alternative ${JSON.stringify(value)} filter is not of type FilterSpec`
      )
    }
  }

  const { operator, value: v } = value

  return {
    [key]: {
      [operator]: v
    }
  }
}

export const createFilter = (
  fields: { [key: string]: unknown },
  type: IntrospectionResource
): FilterMap | undefined => {
  const empty: Filter[] = []

  const filters = Object.keys(fields).reduce((next, key) => {
    const maybeType = type.fields.find(f => f.name === key)
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
