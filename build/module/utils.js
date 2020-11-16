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
import { TypeKind } from 'graphql';
import { CAMEL_REGEX, } from './types';
var ARGUMENT_FILTER = 'filter';
var ARGUMENT_ORDER_BY = 'orderBy';
var DEFAULT_ID_FIELD_NAME = 'id';
var NODE_ID_FIELD_NAME = 'nodeId';
export var capitalize = function (str) { return str[0].toUpperCase() + str.slice(1); };
export var lowercase = function (str) { return str[0].toLowerCase() + str.slice(1); };
export var snake = function (camelCaseInput) { return camelCaseInput.replace(CAMEL_REGEX, '$1_$2'); };
var fieldIsObjectOrListOfObject = function (field) {
    return field.type.kind === TypeKind.OBJECT ||
        (field.type.ofType &&
            (field.type.ofType.kind === TypeKind.OBJECT || field.type.ofType.kind === TypeKind.LIST));
};
export var createSortingKey = function (field, sort) {
    return snake(field).toUpperCase() + "_" + sort.toUpperCase();
};
export var escapeIdType = function (id) { return String(id).replace(/-/gi, '_'); };
export var formatArgumentsAsQuery = function (obj, level) {
    if (level === void 0) { level = 0; }
    if (typeof obj === 'number') {
        return obj;
    }
    if (Array.isArray(obj)) {
        var props = obj
            .map(function (value) { return "" + formatArgumentsAsQuery(value, level + 1); })
            .join(',');
        return "[" + props + "]";
    }
    if (typeof obj === 'object') {
        var props = Object.keys(obj)
            .map(function (key) { return key + ":" + formatArgumentsAsQuery(obj[key], level + 1); })
            .join(',');
        return level === 0 ? props : "{" + props + "}";
    }
    return JSON.stringify(obj);
};
// Maps any input object to variables of a mutation. Passes certain types through a mapping process.
export var mapInputToVariables = function (input, inputType, type, typeConfiguration) {
    var inputFields = inputType.inputFields;
    return inputFields.reduce(function (current, next) {
        var _a, _b;
        var key = next.name;
        if (input[key] === undefined) {
            return current;
        }
        var fieldType = type.fields.find(function (field) { return fieldIsObjectOrListOfObject(field) && field.name === key; });
        if (fieldType) {
            var valueMapperForType = typeConfiguration[fieldType.type.ofType.name];
            if (valueMapperForType && valueMapperForType.queryValueToInputValue) {
                return __assign(__assign({}, current), (_a = {}, _a[key] = valueMapperForType.queryValueToInputValue(input[key]), _a));
            }
        }
        return __assign(__assign({}, current), (_b = {}, _b[key] = input[key], _b));
    }, {});
};
export var queryHasArgument = function (type, argument, queryMap) {
    if (!queryMap[type]) {
        return undefined;
    }
    return queryMap[type].args.find(function (f) { return f.name === argument; });
};
var shouldQueryField = function (fieldName, typeConfig, fetchQueryType) {
    if (typeConfig.includeFields) {
        if (typeof typeConfig.includeFields === 'function') {
            return typeConfig.includeFields(fieldName, fetchQueryType);
        }
        return typeConfig.includeFields.indexOf(fieldName) > -1;
    }
    if (typeConfig.excludeFields) {
        if (typeof typeConfig.excludeFields === 'function') {
            return !typeConfig.excludeFields(fieldName, fetchQueryType);
        }
        return typeConfig.excludeFields.indexOf(fieldName) === -1;
    }
    return true;
};
var applyArgumentsForField = function (fieldName, typeConfig, args) {
    if (typeConfig.computeArgumentsForField) {
        var result = typeConfig.computeArgumentsForField(fieldName, args);
        if (!result) {
            return fieldName;
        }
        return fieldName + "(" + formatArgumentsAsQuery(result) + ")";
    }
    return fieldName;
};
export var createQueryFromType = function (type, typeMap, typeConfiguration, primaryKey, fetchQueryType) {
    return typeMap[type].fields.reduce(function (current, field) {
        // we have to skip fields that require arguments
        var hasArguments = field.args && field.args.length > 0;
        var thisTypeConfig = typeConfiguration[type];
        // We skip fields that have arguments without type config
        if (hasArguments && !thisTypeConfig) {
            return current;
        }
        // We alias the primaryKey to `nodeId` to keep react-admin happy
        var fieldName = primaryKey.field === field && primaryKey.shouldRewrite
            ? DEFAULT_ID_FIELD_NAME + ": " + primaryKey.idKeyName + " " + primaryKey.primaryKeyName
            : field.name;
        if (thisTypeConfig) {
            if (!shouldQueryField(fieldName, thisTypeConfig, fetchQueryType)) {
                return current;
            }
            if (hasArguments) {
                fieldName = applyArgumentsForField(fieldName, thisTypeConfig, field.args);
            }
        }
        if (fieldIsObjectOrListOfObject(field)) {
            var extractFromNonNull = function (type) {
                return type.kind === 'NON_NULL' ? type.ofType : type;
            };
            var extractFromList = function (type) {
                return type.kind === 'LIST' ? type.ofType : type;
            };
            // Get the "base" type of this field. It can be wrapped in a few different ways:
            // - TYPE (bare type)
            // - TYPE! (non-null type)
            // - [TYPE] (list of type)
            // - [TYPE!] (list of non-null type)
            // - [TYPE!]! (non-null list of non-null type)
            var thisType = extractFromNonNull(extractFromList(extractFromNonNull(field.type)));
            var typeName = (thisType === null || thisType === void 0 ? void 0 : thisType.name) || field.type.name;
            var shouldExpand = typeName && typeConfiguration[typeName] && typeConfiguration[typeName].expand;
            if (typeName && shouldExpand) {
                return "\n        " + current + " " + field.name + " {" + createQueryFromType(typeName, typeMap, typeConfiguration, primaryKey, fetchQueryType) + " }\n        ";
            }
            if (!thisType || thisType.kind !== TypeKind.ENUM) {
                return current;
            }
        }
        return current + " " + fieldName;
    }, '');
};
export var createGetManyQuery = function (type, manyLowerResourceName, resourceTypename, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType) {
    if (!queryHasArgument(manyLowerResourceName, ARGUMENT_FILTER, queryMap)) {
        return gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["query ", "{\n      ", " {\n      nodes {\n        ", "\n      }\n    }\n    }"], ["query ", "{\n      ", " {\n      nodes {\n        ",
            "\n      }\n    }\n    }"])), manyLowerResourceName, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType));
    }
    return gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    query ", "($ids: [", "!]) {\n      ", "(filter: { ", ": { in: $ids }}) {\n      nodes {\n        ", "\n      }\n    }\n    }"], ["\n    query ", "($ids: [", "!]) {\n      ", "(filter: { ", ": { in: $ids }}) {\n      nodes {\n        ",
        "\n      }\n    }\n    }"])), manyLowerResourceName, primaryKey.primaryKeyType.name, manyLowerResourceName, primaryKey.primaryKeyName, createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType));
};
var hasOthersThenNaturalOrdering = function (typeMap, orderingArgument) {
    var _a, _b, _c, _d;
    var orderTypeName = (_b = (_a = orderingArgument === null || orderingArgument === void 0 ? void 0 : orderingArgument.ofType) === null || _a === void 0 ? void 0 : _a.ofType) === null || _b === void 0 ? void 0 : _b.name;
    return orderTypeName && ((_d = (_c = typeMap[orderTypeName]) === null || _c === void 0 ? void 0 : _c.enumValues) === null || _d === void 0 ? void 0 : _d.length) > 1;
};
export var createGetListQuery = function (type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType) {
    var hasFilters = queryHasArgument(manyLowerResourceName, ARGUMENT_FILTER, queryMap);
    var ordering = queryHasArgument(manyLowerResourceName, ARGUMENT_ORDER_BY, queryMap);
    var hasOrdering = hasOthersThenNaturalOrdering(typeMap, ordering === null || ordering === void 0 ? void 0 : ordering.type);
    if (!hasFilters && !hasOrdering) {
        return gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["query ", "($offset: Int!, $first: Int!) {\n      ", "(first: $first, offset: $offset) {\n      nodes {\n        ", "\n      }\n      totalCount\n    }\n    }"], ["query ", "($offset: Int!, $first: Int!) {\n      ", "(first: $first, offset: $offset) {\n      nodes {\n        ",
            "\n      }\n      totalCount\n    }\n    }"])), manyLowerResourceName, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType));
    }
    if (!hasFilters && hasOrdering) {
        return gql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["query ", " (\n    $offset: Int!,\n    $first: Int!,\n    $orderBy: [", "OrderBy!]\n    ) {\n      ", "(first: $first, offset: $offset, orderBy: $orderBy) {\n      nodes {\n        ", "\n      }\n      totalCount\n    }\n    }"], ["query ", " (\n    $offset: Int!,\n    $first: Int!,\n    $orderBy: [", "OrderBy!]\n    ) {\n      ", "(first: $first, offset: $offset, orderBy: $orderBy) {\n      nodes {\n        ",
            "\n      }\n      totalCount\n    }\n    }"])), manyLowerResourceName, pluralizedResourceTypeName, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType));
    }
    if (hasFilters && !hasOrdering) {
        return gql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["query ", " (\n    $offset: Int!,\n    $first: Int!,\n    $filter: ", "Filter,\n    ) {\n      ", "(first: $first, offset: $offset, filter: $filter) {\n      nodes {\n        ", "\n      }\n      totalCount\n    }\n    }"], ["query ", " (\n    $offset: Int!,\n    $first: Int!,\n    $filter: ", "Filter,\n    ) {\n      ", "(first: $first, offset: $offset, filter: $filter) {\n      nodes {\n        ",
            "\n      }\n      totalCount\n    }\n    }"])), manyLowerResourceName, resourceTypename, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType));
    }
    return gql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["query ", " (\n  $offset: Int!,\n  $first: Int!,\n  $filter: ", "Filter,\n  $orderBy: [", "OrderBy!]\n  ) {\n    ", "(first: $first, offset: $offset, filter: $filter, orderBy: $orderBy) {\n    nodes {\n      ", "\n    }\n    totalCount\n  }\n  }"], ["query ", " (\n  $offset: Int!,\n  $first: Int!,\n  $filter: ", "Filter,\n  $orderBy: [", "OrderBy!]\n  ) {\n    ", "(first: $first, offset: $offset, filter: $filter, orderBy: $orderBy) {\n    nodes {\n      ",
        "\n    }\n    totalCount\n  }\n  }"])), manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType));
};
export var createTypeMap = function (types) {
    return types.reduce(function (map, next) {
        var _a;
        return __assign(__assign({}, map), (_a = {}, _a[next.name] = next, _a));
    }, {});
};
export var stripUndefined = function (variables) {
    return Object.keys(variables).reduce(function (next, key) {
        var _a;
        if (variables[key] === undefined) {
            return next;
        }
        return __assign(__assign({}, next), (_a = {}, _a[key] = variables[key], _a));
    }, {});
};
var findTypeByName = function (type, name) { var _a; return (_a = type.fields) === null || _a === void 0 ? void 0 : _a.find(function (thisType) { return thisType.name === name; }); };
export var preparePrimaryKey = function (query, resourceName, resourceTypename, type) {
    var _a, _b, _c;
    // in case we don't have any arguments we fall back to the default `id` type.
    var primaryKeyName = ((_a = query === null || query === void 0 ? void 0 : query.args[0]) === null || _a === void 0 ? void 0 : _a.name) || DEFAULT_ID_FIELD_NAME;
    var field = findTypeByName(type, primaryKeyName);
    var primaryKeyType = field === null || field === void 0 ? void 0 : field.type;
    if (!primaryKeyType || !primaryKeyName) {
        throw new Error("Could not determine primaryKey on type " + resourceTypename + " field.\n      Please add a primary key to " + resourceTypename);
    }
    if ((_b = primaryKeyType) === null || _b === void 0 ? void 0 : _b.ofType) {
        primaryKeyType = (_c = primaryKeyType) === null || _c === void 0 ? void 0 : _c.ofType;
    }
    if (primaryKeyName !== DEFAULT_ID_FIELD_NAME) {
        return {
            field: field,
            idKeyName: NODE_ID_FIELD_NAME,
            primaryKeyName: primaryKeyName,
            primaryKeyType: primaryKeyType,
            getResourceName: resourceName + "ByNodeId",
            deleteResourceName: "delete" + resourceTypename + "ByNodeId",
            updateResourceName: "update" + resourceTypename + "ByNodeId",
            shouldRewrite: true,
        };
    }
    return {
        field: field,
        idKeyName: DEFAULT_ID_FIELD_NAME,
        primaryKeyName: primaryKeyName,
        primaryKeyType: primaryKeyType,
        getResourceName: "" + resourceName,
        deleteResourceName: "delete" + resourceTypename,
        updateResourceName: "update" + resourceTypename,
        shouldRewrite: false,
    };
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
