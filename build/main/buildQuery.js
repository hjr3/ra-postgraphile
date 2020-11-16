"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuery = exports.mapType = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const pluralize_1 = __importStar(require("pluralize"));
const ra_core_1 = require("ra-core");
const filters_1 = require("./filters");
const getManyReference_1 = require("./getManyReference");
const utils_1 = require("./utils");
const types_1 = require("./types");
// cache for all types
let typeMap;
let queryMap;
exports.mapType = (idType, value) => ['uuid', 'string'].includes(idType.name.toLowerCase()) ? value : parseInt(value, 10);
exports.buildQuery = (introspectionResults, factory) => (raFetchType, resName, params) => {
    if (!raFetchType || !resName) {
        return { data: null };
    }
    // We do this here because react-admin is sometimes not consistent with the case (EditGuesser, etc)
    const resourceName = pluralize_1.singular(resName);
    const options = factory.options;
    // By default we don't query for any complex types on the object, just scalars and scalars[]
    const typeMapConfiguration = options.typeMap;
    const resourceTypename = utils_1.capitalize(resourceName);
    const { types, queries } = introspectionResults;
    if (!queryMap) {
        queryMap = utils_1.createTypeMap(queries);
    }
    if (!typeMap) {
        typeMap = utils_1.createTypeMap(types);
    }
    const type = typeMap[resourceTypename];
    if (!type) {
        throw new Error(`Type "${resourceTypename}" did not exist in the introspection result.`);
    }
    const pluralizedResourceTypeName = pluralize_1.default(resourceTypename);
    const manyLowerResourceName = utils_1.lowercase(pluralizedResourceTypeName);
    const singleLowerResourceName = utils_1.lowercase(resourceTypename);
    const primaryKey = utils_1.preparePrimaryKey(queryMap[singleLowerResourceName], singleLowerResourceName, resourceTypename, type);
    const { deleteResourceName, getResourceName, updateResourceName, idKeyName, primaryKeyType: primaryKeyType, } = primaryKey;
    switch (raFetchType) {
        case ra_core_1.GET_ONE:
            return {
                query: graphql_tag_1.default `query ${getResourceName}($id: ${primaryKeyType.name}!) {
          ${getResourceName}(${idKeyName}: $id) {
          ${utils_1.createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, ra_core_1.GET_ONE)}
        }
        }`,
                variables: {
                    id: exports.mapType(primaryKeyType, params.id),
                },
                parseResponse: (response) => {
                    return { data: response.data[singleLowerResourceName] };
                },
            };
        case ra_core_1.GET_MANY:
            return {
                query: utils_1.createGetManyQuery(type, manyLowerResourceName, resourceTypename, typeMap, queryMap, typeMapConfiguration, primaryKey, ra_core_1.GET_MANY),
                variables: {
                    ids: params.ids
                        .filter((v) => typeof v !== 'undefined')
                        .map((id) => exports.mapType(primaryKeyType, id)),
                },
                parseResponse: (response) => {
                    const { nodes } = response.data[manyLowerResourceName];
                    return { data: nodes };
                },
            };
        case ra_core_1.GET_MANY_REFERENCE:
            return getManyReference_1.getManyReference(params, type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeMapConfiguration, primaryKey, ra_core_1.GET_MANY_REFERENCE);
        case ra_core_1.GET_LIST: {
            const { filter, sort, pagination } = params;
            const orderBy = sort && sort.field && sort.order
                ? [utils_1.createSortingKey(sort.field, sort.order)]
                : [types_1.NATURAL_SORTING];
            const filters = filters_1.createFilter(filter, type);
            return {
                query: utils_1.createGetListQuery(type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeMapConfiguration, primaryKey, ra_core_1.GET_LIST),
                variables: utils_1.stripUndefined({
                    offset: (pagination.page - 1) * pagination.perPage,
                    first: pagination.perPage,
                    filter: filters,
                    orderBy,
                }),
                parseResponse: (response) => {
                    const { nodes, totalCount } = response.data[manyLowerResourceName];
                    return { data: nodes, total: totalCount };
                },
            };
        }
        case ra_core_1.CREATE: {
            const variables = {
                input: {
                    [singleLowerResourceName]: utils_1.mapInputToVariables(params.data, typeMap[`${resourceTypename}Input`], type, typeMapConfiguration),
                },
            };
            return {
                variables,
                query: graphql_tag_1.default `mutation create${resourceTypename}($input: Create${resourceTypename}Input!) {
          create${resourceTypename} (
          input: $input
        ) {
          ${singleLowerResourceName} {
          ${utils_1.createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, ra_core_1.CREATE)}
        }
        }
        }`,
                parseResponse: (response) => ({
                    data: response.data[`create${resourceTypename}`][singleLowerResourceName],
                }),
            };
        }
        case ra_core_1.DELETE: {
            return {
                variables: {
                    input: {
                        id: exports.mapType(primaryKeyType, params.id),
                    },
                },
                query: graphql_tag_1.default `
          mutation ${deleteResourceName}($input: Delete${resourceTypename}Input!) {
            ${deleteResourceName}(input: $input) {
            ${singleLowerResourceName} {
            ${utils_1.createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, ra_core_1.DELETE)}
          }
          }
          }
        `,
                parseResponse: (response) => ({
                    data: response.data[`${deleteResourceName}`][singleLowerResourceName],
                }),
            };
        }
        case ra_core_1.DELETE_MANY: {
            const thisIds = params.ids;
            const deletions = thisIds.map((id) => ({
                id: exports.mapType(primaryKeyType, id),
                clientMutationId: id.toString(),
            }));
            return {
                variables: deletions.reduce((next, input) => (Object.assign({ [`arg${utils_1.escapeIdType(input.id)}`]: input }, next)), {}),
                query: graphql_tag_1.default `
          mutation deleteMany${resourceTypename}(
          ${thisIds
                    .map((id) => `$arg${utils_1.escapeIdType(id)}: Delete${resourceTypename}Input!`)
                    .join(',')}
          ) {
            ${thisIds.map((id) => `
                k${utils_1.escapeIdType(id)}:${deleteResourceName}(input: $arg${utils_1.escapeIdType(id)}) {
                  clientMutationId
                }\n
                `)}
          }
        `,
                parseResponse: (response) => ({
                    data: thisIds.map((id) => exports.mapType(primaryKeyType, response.data[`k${utils_1.escapeIdType(id)}`].clientMutationId)),
                }),
            };
        }
        case ra_core_1.UPDATE: {
            const updateParams = params;
            const updateVariables = {
                input: {
                    id: exports.mapType(primaryKeyType, updateParams.id),
                    patch: utils_1.mapInputToVariables(updateParams.data, typeMap[`${resourceTypename}Patch`], type, typeMapConfiguration),
                },
            };
            return {
                variables: updateVariables,
                query: graphql_tag_1.default `
          mutation ${updateResourceName}($input: Update${resourceTypename}Input!) {
            ${updateResourceName}(input: $input) {
            ${singleLowerResourceName} {
            ${utils_1.createQueryFromType(resourceTypename, typeMap, typeMapConfiguration, primaryKey, ra_core_1.UPDATE)}
          }
          }
          }
        `,
                parseResponse: (response) => ({
                    data: response.data[`${updateResourceName}`][singleLowerResourceName],
                }),
            };
        }
        case ra_core_1.UPDATE_MANY: {
            const { ids, data } = params;
            const inputs = ids.map((id) => ({
                id: exports.mapType(primaryKeyType, id),
                clientMutationId: id.toString(),
                patch: utils_1.mapInputToVariables(data, typeMap[`${resourceTypename}Patch`], type, typeMapConfiguration),
            }));
            return {
                variables: inputs.reduce((next, input) => (Object.assign({ [`arg${utils_1.escapeIdType(input.id)}`]: input }, next)), {}),
                query: graphql_tag_1.default `mutation updateMany${resourceTypename}(
        ${ids.map((id) => `$arg${utils_1.escapeIdType(id)}: Update${resourceTypename}Input!`).join(',')}) {
          ${inputs.map((input) => {
                    return `
             update${utils_1.escapeIdType(input.id)}:${updateResourceName}(input: $arg${utils_1.escapeIdType(input.id)}) {
               clientMutationId
             }
            `;
                })}
        }`,
                parseResponse: (response) => ({
                    data: ids.map((id) => exports.mapType(primaryKeyType, response.data[`update${utils_1.escapeIdType(id)}`].clientMutationId)),
                }),
            };
        }
        default:
            throw new Error(`${raFetchType} is not yet implemented.`);
    }
};
