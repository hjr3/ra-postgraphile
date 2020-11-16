"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManyReference = void 0;
const filters_1 = require("./filters");
const types_1 = require("./types");
const utils_1 = require("./utils");
exports.getManyReference = (params, type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType) => {
    const { filter, sort, target, id, pagination } = params;
    const orderBy = sort
        ? [utils_1.createSortingKey(sort.field, sort.order)]
        : [types_1.NATURAL_SORTING];
    const filters = filters_1.createFilter(Object.assign({ [target]: id }, filter), type);
    return {
        query: utils_1.createGetListQuery(type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType),
        variables: {
            offset: (pagination.page - 1) * pagination.perPage,
            first: pagination.perPage,
            filter: filters,
            orderBy,
        },
        parseResponse: (response) => {
            const { nodes, totalCount } = response.data[manyLowerResourceName];
            return {
                data: nodes,
                total: totalCount,
            };
        },
    };
};
