'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k]
    result['default'] = mod
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
const graphql_tag_1 = __importDefault(require('graphql-tag'))
const pluralize_1 = __importStar(require('pluralize'))
const types_1 = require('./types')
exports.capitalize = str => str[0].toUpperCase() + str.slice(1)
exports.lowercase = str => str[0].toLowerCase() + str.slice(1)
exports.snake = camelCaseInput =>
  camelCaseInput.replace(types_1.CAMEL_REGEX, '$1_$2')
const fieldIsObjectOrListOfObject = field =>
  field.type.kind === 'OBJECT' ||
  (field.type.ofType &&
    (field.type.ofType.kind === 'OBJECT' || field.type.ofType.kind === 'LIST'))
exports.createSortingKey = (field, sort) => {
  return `${exports.snake(field).toUpperCase()}_${sort}`
}
// Maps any input object to variables of a mutation. Passes certain types through a mapping process.
exports.mapInputToVariables = (input, inputType, type, typeMapper) => {
  const inputFields = inputType.inputFields
  return inputFields.reduce((current, next) => {
    const key = next.name
    if (input[key] === undefined) {
      return current
    }
    const fieldType = type.fields.find(
      field => fieldIsObjectOrListOfObject(field) && field.name === key
    )
    if (fieldType) {
      const valueMapperForType = typeMapper[fieldType.type.ofType.name]
      if (valueMapperForType) {
        return Object.assign(Object.assign({}, current), {
          [key]: valueMapperForType(input[key])
        })
      }
    }
    return Object.assign(Object.assign({}, current), { [key]: input[key] })
  }, {})
}
exports.queryHasFilter = (type, queryMap) => {
  if (!queryMap[type]) {
    return false
  }
  return Boolean(queryMap[type].args.find(f => f.name === 'filter'))
}
exports.createQueryFromType = (type, typeMap, allowedTypes) => {
  return typeMap[pluralize_1.singular(type)].fields.reduce((current, field) => {
    // we have to skip fields that require arguments
    if (field.args && field.args.length > 0) {
      return current
    }
    if (fieldIsObjectOrListOfObject(field)) {
      const thisType =
        field.type.ofType && // We also handle cases where we have e.g. [TYPE!] (List of type)
        (field.type.ofType.name ? field.type.ofType : field.type.ofType.ofType)
      const typeName = thisType && thisType.name
      if (typeName && allowedTypes.indexOf(typeName) !== -1) {
        return `
        ${current} ${field.name} {${exports.createQueryFromType(
          typeName,
          typeMap,
          allowedTypes
        )} }
        `
      }
      if (!thisType || thisType.kind !== 'ENUM') {
        return current
      }
    }
    return `${current} ${field.name}`
  }, '')
}
exports.createGetManyQuery = (
  type,
  manyLowerResourceName,
  resourceTypename,
  typeMap,
  queryMap,
  allowedTypes,
  idType
) => {
  if (!exports.queryHasFilter(manyLowerResourceName, queryMap)) {
    return graphql_tag_1.default`query ${manyLowerResourceName}{
      ${manyLowerResourceName} {
      nodes {
        ${exports.createQueryFromType(resourceTypename, typeMap, allowedTypes)}
      }
    }
    }`
  }
  return graphql_tag_1.default`
    query ${manyLowerResourceName}($ids: [${idType}!]) {
        ${manyLowerResourceName}(filter: { id: { in: $ids }}) {
        nodes {
            ${exports.createQueryFromType(
              resourceTypename,
              typeMap,
              allowedTypes
            )}
        }
      }
    }`
}
exports.createGetListQuery = (
  type,
  manyLowerResourceName,
  resourceTypename,
  typeMap,
  queryMap,
  allowedTypes
) => {
  if (!exports.queryHasFilter(manyLowerResourceName, queryMap)) {
    return graphql_tag_1.default`query ${manyLowerResourceName}($offset: Int!, $first: Int!) {
      ${manyLowerResourceName}(first: $first, offset: $offset) {
      nodes {
        ${exports.createQueryFromType(resourceTypename, typeMap, allowedTypes)}
      }
      totalCount
    }
    }`
  }
  return graphql_tag_1.default`query ${manyLowerResourceName} (
    $offset: Int!,
    $first: Int!,
    $filter: ${resourceTypename}Filter,
    $orderBy: [${pluralize_1.default(resourceTypename)}OrderBy!]
    ) {
        ${manyLowerResourceName}(first: $first, offset: $offset, filter: $filter, orderBy: $orderBy) {
        nodes {
            ${exports.createQueryFromType(
              resourceTypename,
              typeMap,
              allowedTypes
            )}
        }
        totalCount
      }
    }`
}
exports.createTypeMap = types => {
  return types.reduce((map, next) => {
    return Object.assign(Object.assign({}, map), { [next.name]: next })
  }, {})
}
