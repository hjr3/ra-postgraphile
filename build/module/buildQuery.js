var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import gql from 'graphql-tag';
import pluralize, { singular } from 'pluralize';
import { GET_MANY, GET_LIST, CREATE, UPDATE, UPDATE_MANY, GET_ONE, GET_MANY_REFERENCE, DELETE_MANY, DELETE, } from 'ra-core';
import { createFilter } from './filters';
import { getManyReference } from './getManyReference';
import { capitalize, createGetListQuery, createGetManyQuery, createQueryFromType, createSortingKey, createTypeMap, escapeIdType, preparePrimaryKey, lowercase, mapInputToVariables, stripUndefined, } from './utils';
import { NATURAL_SORTING } from './types';
// cache for all types
var typeMap;
var queryMap;
export var mapType = function (idType, value) {
    return ['uuid', 'string'].includes(idType.name.toLowerCase()) ? value : parseInt(value, 10);
};
export var buildQuery = function (introspectionResults, factory) { return function (raFetchType, resName, params) {
    var _a;
    if (!raFetchType || !resName) {
        return { data: null };
    }
    // We do this here because react-admin is sometimes not consistent with the case (EditGuesser, etc)
    var resourceName = singular(resName);
    var options = factory.options;
    // By default we don't query for any complex types on the object, just scalars and scalars[]
    var typeMapConfiguration = options.typeMap;
    var resourceTypename = capitalize(resourceName);
    var types = introspectionResults.types, queries = introspectionResults.queries;
    if (!queryMap) {
        queryMap = createTypeMap(queries);
    }
    if (!typeMap) {
        typeMap = createTypeMap(types);
    }
    var type = typeMap[resourceTypename];
    if (!type) {
        throw new Error("Type \"" + resourceTypename + "\" did not exist in the introspection result.");
    }
    var pluralizedResourceTypeName = pluralize(resourceTypename);
    var manyLowerResourceName = lowercase(pluralizedResourceTypeName);
    var singleLowerResourceName = lowercase(resourceTypename);
    var primaryKey = preparePrimaryKey(queryMap[singleLowerResourceName], singleLowerResourceName, resourceTypename, type);
    var deleteResourceName = primaryKey.deleteResourceName, getResourceName = primaryKey.getResourceName, updateResourceName = primaryKey.updateResourceName, idKeyName = primaryKey.idKeyName, primaryKeyType = primaryKey.primaryKeyType;
    switch (raFetchType) {
        case GET_ONE:
            return {
                query: gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["query ", "($id: ", "!) {\n          ", "(", ": $id) {\n          ", "\n        }\n        }"], ["query ", "($id: ", "!) {\n          ", "(", ": $id) {\n          ",
                    "\n        }\n        }"])), getResourceName, primaryKeyType.name, getResourceName, idKeyName, createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, GET_ONE)),
                variables: {
                    id: mapType(primaryKeyType, params.id),
                },
                parseResponse: function (response) {
                    return { data: response.data[singleLowerResourceName] };
                },
            };
        case GET_MANY:
            return {
                query: createGetManyQuery(type, manyLowerResourceName, resourceTypename, typeMap, queryMap, typeMapConfiguration, primaryKey, GET_MANY),
                variables: {
                    ids: params.ids
                        .filter(function (v) { return typeof v !== 'undefined'; })
                        .map(function (id) { return mapType(primaryKeyType, id); }),
                },
                parseResponse: function (response) {
                    var nodes = response.data[manyLowerResourceName].nodes;
                    return { data: nodes };
                },
            };
        case GET_MANY_REFERENCE:
            return getManyReference(params, type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeMapConfiguration, primaryKey, GET_MANY_REFERENCE);
        case GET_LIST: {
            var _b = params, filter = _b.filter, sort = _b.sort, pagination = _b.pagination;
            var orderBy = sort && sort.field && sort.order
                ? [createSortingKey(sort.field, sort.order)]
                : [NATURAL_SORTING];
            var filters = createFilter(filter, type);
            return {
                query: createGetListQuery(type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeMapConfiguration, primaryKey, GET_LIST),
                variables: stripUndefined({
                    offset: (pagination.page - 1) * pagination.perPage,
                    first: pagination.perPage,
                    filter: filters,
                    orderBy: orderBy,
                }),
                parseResponse: function (response) {
                    var _a = response.data[manyLowerResourceName], nodes = _a.nodes, totalCount = _a.totalCount;
                    return { data: nodes, total: totalCount };
                },
            };
        }
        case CREATE: {
            var variables = {
                input: (_a = {},
                    _a[singleLowerResourceName] = mapInputToVariables(params.data, typeMap[resourceTypename + "Input"], type, typeMapConfiguration),
                    _a),
            };
            return {
                variables: variables,
                query: gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["mutation create", "($input: Create", "Input!) {\n          create", " (\n          input: $input\n        ) {\n          ", " {\n          ", "\n        }\n        }\n        }"], ["mutation create", "($input: Create", "Input!) {\n          create", " (\n          input: $input\n        ) {\n          ", " {\n          ",
                    "\n        }\n        }\n        }"])), resourceTypename, resourceTypename, resourceTypename, singleLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, CREATE)),
                parseResponse: function (response) { return ({
                    data: response.data["create" + resourceTypename][singleLowerResourceName],
                }); },
            };
        }
        case DELETE: {
            return {
                variables: {
                    input: {
                        id: mapType(primaryKeyType, params.id),
                    },
                },
                query: gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n          mutation ", "($input: Delete", "Input!) {\n            ", "(input: $input) {\n            ", " {\n            ", "\n          }\n          }\n          }\n        "], ["\n          mutation ", "($input: Delete", "Input!) {\n            ", "(input: $input) {\n            ", " {\n            ",
                    "\n          }\n          }\n          }\n        "])), deleteResourceName, resourceTypename, deleteResourceName, singleLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, DELETE)),
                parseResponse: function (response) { return ({
                    data: response.data["" + deleteResourceName][singleLowerResourceName],
                }); },
            };
        }
        case DELETE_MANY: {
            var thisIds_1 = params.ids;
            var deletions = thisIds_1.map(function (id) { return ({
                id: mapType(primaryKeyType, id),
                clientMutationId: id.toString(),
            }); });
            return {
                variables: deletions.reduce(function (next, input) {
                    var _a;
                    return (__assign((_a = {}, _a["arg" + escapeIdType(input.id)] = input, _a), next));
                }, {}),
                query: gql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n          mutation deleteMany", "(\n          ", "\n          ) {\n            ", "\n          }\n        "], ["\n          mutation deleteMany", "(\n          ",
                    "\n          ) {\n            ",
                    "\n          }\n        "])), resourceTypename, thisIds_1
                    .map(function (id) { return "$arg" + escapeIdType(id) + ": Delete" + resourceTypename + "Input!"; })
                    .join(','), thisIds_1.map(function (id) { return "\n                k" + escapeIdType(id) + ":" + deleteResourceName + "(input: $arg" + escapeIdType(id) + ") {\n                  clientMutationId\n                }\n\n                "; })),
                parseResponse: function (response) { return ({
                    data: thisIds_1.map(function (id) {
                        return mapType(primaryKeyType, response.data["k" + escapeIdType(id)].clientMutationId);
                    }),
                }); },
            };
        }
        case UPDATE: {
            var updateParams = params;
            var updateVariables = {
                input: {
                    id: mapType(primaryKeyType, updateParams.id),
                    patch: mapInputToVariables(updateParams.data, typeMap[resourceTypename + "Patch"], type, typeMapConfiguration),
                },
            };
            return {
                variables: updateVariables,
                query: gql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n          mutation ", "($input: Update", "Input!) {\n            ", "(input: $input) {\n            ", " {\n            ", "\n          }\n          }\n          }\n        "], ["\n          mutation ", "($input: Update", "Input!) {\n            ", "(input: $input) {\n            ", " {\n            ",
                    "\n          }\n          }\n          }\n        "])), updateResourceName, resourceTypename, updateResourceName, singleLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, UPDATE)),
                parseResponse: function (response) { return ({
                    data: response.data["" + updateResourceName][singleLowerResourceName],
                }); },
            };
        }
        case UPDATE_MANY: {
            var _c = params, ids_1 = _c.ids, data_1 = _c.data;
            var inputs = ids_1.map(function (id) { return ({
                id: mapType(primaryKeyType, id),
                clientMutationId: id.toString(),
                patch: mapInputToVariables(data_1, typeMap[resourceTypename + "Patch"], type, typeMapConfiguration),
            }); });
            return {
                variables: inputs.reduce(function (next, input) {
                    var _a;
                    return (__assign((_a = {}, _a["arg" + escapeIdType(input.id)] = input, _a), next));
                }, {}),
                query: gql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["mutation updateMany", "(\n        ", ") {\n          ", "\n        }"], ["mutation updateMany", "(\n        ", ") {\n          ",
                    "\n        }"])), resourceTypename, ids_1.map(function (id) { return "$arg" + escapeIdType(id) + ": Update" + resourceTypename + "Input!"; }).join(','), inputs.map(function (input) {
                    return "\n             update" + escapeIdType(input.id) + ":" + updateResourceName + "(input: $arg" + escapeIdType(input.id) + ") {\n               clientMutationId\n             }\n            ";
                })),
                parseResponse: function (response) { return ({
                    data: ids_1.map(function (id) {
                        return mapType(primaryKeyType, response.data["update" + escapeIdType(id)].clientMutationId);
                    }),
                }); },
            };
        }
        default:
            throw new Error(raFetchType + " is not yet implemented.");
    }
}; };
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
