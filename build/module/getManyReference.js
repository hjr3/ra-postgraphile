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
import { createFilter } from './filters';
import { NATURAL_SORTING, } from './types';
import { createGetListQuery, createSortingKey } from './utils';
export var getManyReference = function (params, type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType) {
    var _a;
    var filter = params.filter, sort = params.sort, target = params.target, id = params.id, pagination = params.pagination;
    var orderBy = sort
        ? [createSortingKey(sort.field, sort.order)]
        : [NATURAL_SORTING];
    var filters = createFilter(__assign((_a = {}, _a[target] = id, _a), filter), type);
    return {
        query: createGetListQuery(type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType),
        variables: {
            offset: (pagination.page - 1) * pagination.perPage,
            first: pagination.perPage,
            filter: filters,
            orderBy: orderBy,
        },
        parseResponse: function (response) {
            var _a = response.data[manyLowerResourceName], nodes = _a.nodes, totalCount = _a.totalCount;
            return {
                data: nodes,
                total: totalCount,
            };
        },
    };
};
