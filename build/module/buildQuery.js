var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function(cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw })
    } else {
      cooked.raw = raw
    }
    return cooked
  }
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
import gql from 'graphql-tag'
import pluralize, { singular } from 'pluralize'
import { createFilter } from './filters'
import { getManyReference } from './getManyReference'
import {
  capitalize,
  createGetListQuery,
  createGetManyQuery,
  createQueryFromType,
  createSortingKey,
  createTypeMap,
  lowercase,
  mapInputToVariables
} from './utils'
import {
  NATURAL_SORTING,
  VERB_CREATE,
  VERB_DELETE,
  VERB_DELETE_MANY,
  VERB_GET_LIST,
  VERB_GET_MANY,
  VERB_GET_MANY_REFERENCE,
  VERB_GET_ONE,
  VERB_UPDATE,
  VERB_UPDATE_MANY
} from './types'
// cache for all types
var typeMap
var queryMap
export var mapType = function(idType, value) {
  return ['uuid', 'string'].includes(idType.name.toLowerCase())
    ? value
    : parseInt(value, 10)
}
export var buildQuery = function(introspectionResults, factory) {
  return function(raFetchType, resName, params) {
    var _a
    if (!raFetchType || !resName) {
      return { data: null }
    }
    // We do this here because react-admin is sometimes not consistent with the case (EditGuesser, etc)
    var resourceName = singular(resName)
    var options = factory.options
    // By default we don't query for any complex types on the object, just scalars and scalars[]
    var allowedComplexTypes = Object.keys(options.queryValueToInputValueMap)
    var resourceTypename = capitalize(resourceName)
    var types = introspectionResults.types,
      queries = introspectionResults.queries
    if (!queryMap) {
      // tslint:disable-next-line:no-expression-statement
      queryMap = createTypeMap(queries)
    }
    if (!typeMap) {
      // tslint:disable-next-line:no-expression-statement
      typeMap = createTypeMap(types)
    }
    var type = typeMap[resourceTypename]
    var manyLowerResourceName = pluralize(lowercase(resourceTypename))
    var singleLowerResourceName = lowercase(resourceTypename)
    var idField = type.fields.find(function(thisType) {
      return thisType.name === 'id'
    })
    // tslint:disable-next-line:no-let
    var idType = idField.type
    if (idType.ofType) {
      // tslint:disable-next-line:no-expression-statement
      idType = idType.ofType
    }
    switch (raFetchType) {
      case VERB_GET_ONE:
        return {
          query: gql(
            templateObject_1 ||
              (templateObject_1 = __makeTemplateObject(
                [
                  'query ',
                  '($id: ',
                  '!) {\n            ',
                  '(id: $id) {\n            ',
                  '\n        }\n        }'
                ],
                [
                  'query ',
                  '($id: ',
                  '!) {\n            ',
                  '(id: $id) {\n            ',
                  '\n        }\n        }'
                ]
              )),
            singleLowerResourceName,
            idType.name,
            singleLowerResourceName,
            createQueryFromType(resourceTypename, typeMap, allowedComplexTypes)
          ),
          variables: {
            id: mapType(idType, params.id)
          },
          parseResponse: function(response) {
            return { data: response.data[singleLowerResourceName] }
          }
        }
      case VERB_GET_MANY:
        return {
          query: createGetManyQuery(
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
              .filter(function(v) {
                return typeof v !== 'undefined'
              })
              .map(function(id) {
                return mapType(idType, id)
              })
          },
          parseResponse: function(response) {
            var nodes = response.data[manyLowerResourceName].nodes
            return { data: nodes }
          }
        }
      case VERB_GET_MANY_REFERENCE:
        return getManyReference(
          params,
          type,
          manyLowerResourceName,
          resourceTypename,
          typeMap,
          queryMap,
          allowedComplexTypes
        )
      case VERB_GET_LIST: {
        var _b = params,
          filter = _b.filter,
          sort = _b.sort
        var orderBy = sort
          ? [createSortingKey(sort.field, sort.order)]
          : [NATURAL_SORTING]
        var filters = createFilter(filter, type)
        return {
          query: createGetListQuery(
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
            orderBy: orderBy
          },
          parseResponse: function(response) {
            var _a = response.data[manyLowerResourceName],
              nodes = _a.nodes,
              totalCount = _a.totalCount
            return { data: nodes, total: totalCount }
          }
        }
      }
      case VERB_CREATE: {
        var variables = {
          input:
            ((_a = {}),
            (_a[singleLowerResourceName] = mapInputToVariables(
              params.data,
              typeMap[resourceTypename + 'Input'],
              type,
              options.queryValueToInputValueMap
            )),
            _a)
        }
        return {
          variables: variables,
          query: gql(
            templateObject_2 ||
              (templateObject_2 = __makeTemplateObject(
                [
                  'mutation create',
                  '($input: Create',
                  'Input!) {\n          create',
                  ' (\n          input: $input\n        ) {\n          ',
                  ' {\n          ',
                  '\n        }\n        }\n        }'
                ],
                [
                  'mutation create',
                  '($input: Create',
                  'Input!) {\n          create',
                  ' (\n          input: $input\n        ) {\n          ',
                  ' {\n          ',
                  '\n        }\n        }\n        }'
                ]
              )),
            resourceTypename,
            resourceTypename,
            resourceTypename,
            singleLowerResourceName,
            createQueryFromType(resourceTypename, typeMap, allowedComplexTypes)
          ),
          parseResponse: function(response) {
            return {
              data:
                response.data['create' + resourceTypename][
                  singleLowerResourceName
                ]
            }
          }
        }
      }
      case VERB_DELETE: {
        return {
          variables: {
            input: {
              id: mapType(idType, params.id)
            }
          },
          query: gql(
            templateObject_3 ||
              (templateObject_3 = __makeTemplateObject(
                [
                  '\n          mutation delete',
                  '($input: Delete',
                  'Input!) {\n            delete',
                  '(input: $input) {\n            ',
                  ' {\n            ',
                  '\n          }\n          }\n          }\n        '
                ],
                [
                  '\n          mutation delete',
                  '($input: Delete',
                  'Input!) {\n            delete',
                  '(input: $input) {\n            ',
                  ' {\n            ',
                  '\n          }\n          }\n          }\n        '
                ]
              )),
            resourceTypename,
            resourceTypename,
            resourceTypename,
            singleLowerResourceName,
            createQueryFromType(resourceTypename, typeMap, allowedComplexTypes)
          ),
          parseResponse: function(response) {
            return {
              data:
                response.data['delete' + resourceTypename][
                  singleLowerResourceName
                ]
            }
          }
        }
      }
      case VERB_DELETE_MANY: {
        var thisIds = params.ids
        var deletions = thisIds.map(function(id) {
          return {
            id: mapType(idType, id),
            clientMutationId: id.toString()
          }
        })
        return {
          variables: deletions.reduce(function(next, input) {
            var _a
            return __assign(
              ((_a = {}), (_a['arg' + input.id] = input), _a),
              next
            )
          }, {}),
          query: gql(
            templateObject_4 ||
              (templateObject_4 = __makeTemplateObject(
                [
                  '\n            mutation deleteMany',
                  '(\n            ',
                  '\n            ) {\n            ',
                  '\n            }\n        '
                ],
                [
                  '\n            mutation deleteMany',
                  '(\n            ',
                  '\n            ) {\n            ',
                  '\n            }\n        '
                ]
              )),
            resourceTypename,
            thisIds
              .map(function(id) {
                return '$arg' + id + ': Delete' + resourceTypename + 'Input!'
              })
              .join(','),
            params.ids.map(function(id) {
              return (
                '\n                k' +
                id +
                ':delete' +
                resourceTypename +
                '(input: $arg' +
                id +
                ') {\n                  clientMutationId\n                }\n\n                '
              )
            })
          ),
          parseResponse: function(response) {
            return {
              data: params.ids.map(function(id) {
                return mapType(idType, response.data['k' + id].clientMutationId)
              })
            }
          }
        }
      }
      case VERB_UPDATE: {
        var updateVariables = {
          input: {
            id: mapType(idType, params.id),
            patch: mapInputToVariables(
              params.data,
              typeMap[resourceTypename + 'Patch'],
              type,
              options.queryValueToInputValueMap
            )
          }
        }
        return {
          variables: updateVariables,
          query: gql(
            templateObject_5 ||
              (templateObject_5 = __makeTemplateObject(
                [
                  '\n          mutation update',
                  '($input: Update',
                  'Input!) {\n            update',
                  '(input: $input) {\n            ',
                  ' {\n            ',
                  '\n          }\n          }\n          }\n        '
                ],
                [
                  '\n          mutation update',
                  '($input: Update',
                  'Input!) {\n            update',
                  '(input: $input) {\n            ',
                  ' {\n            ',
                  '\n          }\n          }\n          }\n        '
                ]
              )),
            resourceTypename,
            resourceTypename,
            resourceTypename,
            singleLowerResourceName,
            createQueryFromType(resourceTypename, typeMap, allowedComplexTypes)
          ),
          parseResponse: function(response) {
            return {
              data:
                response.data['update' + resourceTypename][
                  singleLowerResourceName
                ]
            }
          }
        }
      }
      case VERB_UPDATE_MANY: {
        var _c = params,
          ids_1 = _c.ids,
          data_1 = _c.data
        var inputs = ids_1.map(function(id) {
          return {
            id: mapType(idType, id),
            clientMutationId: id.toString(),
            patch: mapInputToVariables(
              data_1,
              typeMap[resourceTypename + 'Patch'],
              type,
              options.queryValueToInputValueMap
            )
          }
        })
        return {
          variables: inputs.reduce(function(next, input) {
            var _a
            return __assign(
              ((_a = {}), (_a['arg' + input.id] = input), _a),
              next
            )
          }, {}),
          query: gql(
            templateObject_6 ||
              (templateObject_6 = __makeTemplateObject(
                [
                  'mutation updateMany',
                  '(\n        ',
                  ') {\n          ',
                  '\n        }'
                ],
                [
                  'mutation updateMany',
                  '(\n        ',
                  ') {\n          ',
                  '\n        }'
                ]
              )),
            resourceTypename,
            ids_1
              .map(function(id) {
                return '$arg' + id + ': Update' + resourceTypename + 'Input!'
              })
              .join(','),
            inputs.map(function(input) {
              return (
                '\n             update' +
                input.id +
                ':update' +
                resourceTypename +
                '(input: $arg' +
                input.id +
                ') {\n               clientMutationId\n             }\n            '
              )
            })
          ),
          parseResponse: function(response) {
            return {
              data: ids_1.map(function(id) {
                return mapType(
                  idType,
                  response.data['update' + id].clientMutationId
                )
              })
            }
          }
        }
      }
      default:
        throw new Error(raFetchType + ' is not yet implemented.')
    }
  }
}
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6
