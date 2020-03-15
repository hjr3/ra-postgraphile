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
const filters_1 = require('./filters')
const getManyReference_1 = require('./getManyReference')
const utils_1 = require('./utils')
const types_1 = require('./types')
// cache for all types
let typeMap
let queryMap
exports.mapType = (idType, value) =>
  ['uuid', 'string'].includes(idType.name.toLowerCase())
    ? value
    : parseInt(value, 10)
exports.buildQuery = (introspectionResults, factory) => (
  raFetchType,
  resName,
  params
) => {
  if (!raFetchType || !resName) {
    return { data: null }
  }
  // We do this here because react-admin is sometimes not consistent with the case (EditGuesser, etc)
  const resourceName = pluralize_1.singular(resName)
  const options = factory.options
  // By default we don't query for any complex types on the object, just scalars and scalars[]
  const allowedComplexTypes = Object.keys(options.queryValueToInputValueMap)
  const resourceTypename = utils_1.capitalize(resourceName)
  const { types, queries } = introspectionResults
  if (!queryMap) {
    // tslint:disable-next-line:no-expression-statement
    queryMap = utils_1.createTypeMap(queries)
  }
  if (!typeMap) {
    // tslint:disable-next-line:no-expression-statement
    typeMap = utils_1.createTypeMap(types)
  }
  const type = typeMap[resourceTypename]
  const manyLowerResourceName = pluralize_1.default(
    utils_1.lowercase(resourceTypename)
  )
  const singleLowerResourceName = utils_1.lowercase(resourceTypename)
  const idField = type.fields.find(thisType => thisType.name === 'id')
  // tslint:disable-next-line:no-let
  let idType = idField.type
  if (idType.ofType) {
    // tslint:disable-next-line:no-expression-statement
    idType = idType.ofType
  }
  switch (raFetchType) {
    case types_1.VERB_GET_ONE:
      return {
        query: graphql_tag_1.default`query ${singleLowerResourceName}($id: ${
          idType.name
        }!) {
            ${singleLowerResourceName}(id: $id) {
            ${utils_1.createQueryFromType(
              resourceTypename,
              typeMap,
              allowedComplexTypes
            )}
        }
        }`,
        variables: {
          id: exports.mapType(idType, params.id)
        },
        parseResponse: response => {
          return { data: response.data[singleLowerResourceName] }
        }
      }
    case types_1.VERB_GET_MANY:
      return {
        query: utils_1.createGetManyQuery(
          type,
          manyLowerResourceName,
          resourceTypename,
          typeMap,
          queryMap,
          allowedComplexTypes,
          idType.name
        ),
        variables: {
          ids: params.ids
            .filter(v => typeof v !== 'undefined')
            .map(id => exports.mapType(idType, id))
        },
        parseResponse: response => {
          const { nodes } = response.data[manyLowerResourceName]
          return { data: nodes }
        }
      }
    case types_1.VERB_GET_MANY_REFERENCE:
      return getManyReference_1.getManyReference(
        params,
        type,
        manyLowerResourceName,
        resourceTypename,
        typeMap,
        queryMap,
        allowedComplexTypes
      )
    case types_1.VERB_GET_LIST: {
      const { filter, sort } = params
      const orderBy = sort
        ? [utils_1.createSortingKey(sort.field, sort.order)]
        : [types_1.NATURAL_SORTING]
      const filters = filters_1.createFilter(filter, type)
      return {
        query: utils_1.createGetListQuery(
          type,
          manyLowerResourceName,
          resourceTypename,
          typeMap,
          queryMap,
          allowedComplexTypes
        ),
        variables: {
          offset: (params.pagination.page - 1) * params.pagination.perPage,
          first: params.pagination.perPage,
          filter: filters,
          orderBy
        },
        parseResponse: response => {
          const { nodes, totalCount } = response.data[manyLowerResourceName]
          return { data: nodes, total: totalCount }
        }
      }
    }
    case types_1.VERB_CREATE: {
      const variables = {
        input: {
          [singleLowerResourceName]: utils_1.mapInputToVariables(
            params.data,
            typeMap[`${resourceTypename}Input`],
            type,
            options.queryValueToInputValueMap
          )
        }
      }
      return {
        variables,
        query: graphql_tag_1.default`mutation create${resourceTypename}($input: Create${resourceTypename}Input!) {
          create${resourceTypename} (
          input: $input
        ) {
          ${singleLowerResourceName} {
          ${utils_1.createQueryFromType(
            resourceTypename,
            typeMap,
            allowedComplexTypes
          )}
        }
        }
        }`,
        parseResponse: response => ({
          data:
            response.data[`create${resourceTypename}`][singleLowerResourceName]
        })
      }
    }
    case types_1.VERB_DELETE: {
      return {
        variables: {
          input: {
            id: exports.mapType(idType, params.id)
          }
        },
        query: graphql_tag_1.default`
          mutation delete${resourceTypename}($input: Delete${resourceTypename}Input!) {
            delete${resourceTypename}(input: $input) {
            ${singleLowerResourceName} {
            ${utils_1.createQueryFromType(
              resourceTypename,
              typeMap,
              allowedComplexTypes
            )}
          }
          }
          }
        `,
        parseResponse: response => ({
          data:
            response.data[`delete${resourceTypename}`][singleLowerResourceName]
        })
      }
    }
    case types_1.VERB_DELETE_MANY: {
      const thisIds = params.ids
      const deletions = thisIds.map(id => ({
        id: exports.mapType(idType, id),
        clientMutationId: id.toString()
      }))
      return {
        variables: deletions.reduce(
          (next, input) => Object.assign({ [`arg${input.id}`]: input }, next),
          {}
        ),
        query: graphql_tag_1.default`
            mutation deleteMany${resourceTypename}(
            ${thisIds
              .map(id => `$arg${id}: Delete${resourceTypename}Input!`)
              .join(',')}
            ) {
            ${params.ids.map(
              id => `
                k${id}:delete${resourceTypename}(input: $arg${id}) {
                  clientMutationId
                }\n
                `
            )}
            }
        `,
        parseResponse: response => ({
          data: params.ids.map(id =>
            exports.mapType(idType, response.data[`k${id}`].clientMutationId)
          )
        })
      }
    }
    case types_1.VERB_UPDATE: {
      const updateVariables = {
        input: {
          id: exports.mapType(idType, params.id),
          patch: utils_1.mapInputToVariables(
            params.data,
            typeMap[`${resourceTypename}Patch`],
            type,
            options.queryValueToInputValueMap
          )
        }
      }
      return {
        variables: updateVariables,
        query: graphql_tag_1.default`
          mutation update${resourceTypename}($input: Update${resourceTypename}Input!) {
            update${resourceTypename}(input: $input) {
            ${singleLowerResourceName} {
            ${utils_1.createQueryFromType(
              resourceTypename,
              typeMap,
              allowedComplexTypes
            )}
          }
          }
          }
        `,
        parseResponse: response => ({
          data:
            response.data[`update${resourceTypename}`][singleLowerResourceName]
        })
      }
    }
    case types_1.VERB_UPDATE_MANY: {
      const { ids, data } = params
      const inputs = ids.map(id => ({
        id: exports.mapType(idType, id),
        clientMutationId: id.toString(),
        patch: utils_1.mapInputToVariables(
          data,
          typeMap[`${resourceTypename}Patch`],
          type,
          options.queryValueToInputValueMap
        )
      }))
      return {
        variables: inputs.reduce(
          (next, input) => Object.assign({ [`arg${input.id}`]: input }, next),
          {}
        ),
        query: graphql_tag_1.default`mutation updateMany${resourceTypename}(
        ${ids
          .map(id => `$arg${id}: Update${resourceTypename}Input!`)
          .join(',')}) {
          ${inputs.map(input => {
            return `
             update${input.id}:update${resourceTypename}(input: $arg${input.id}) {
               clientMutationId
             }
            `
          })}
        }`,
        parseResponse: response => ({
          data: ids.map(id =>
            exports.mapType(
              idType,
              response.data[`update${id}`].clientMutationId
            )
          )
        })
      }
    }
    default:
      throw new Error(`${raFetchType} is not yet implemented.`)
  }
}
