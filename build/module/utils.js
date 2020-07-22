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
import { CAMEL_REGEX } from './types';
export var capitalize = function (str) { return str[0].toUpperCase() + str.slice(1); };
export var lowercase = function (str) { return str[0].toLowerCase() + str.slice(1); };
export var snake = function (camelCaseInput) {
    return camelCaseInput.replace(CAMEL_REGEX, '$1_$2');
};
var fieldIsObjectOrListOfObject = function (field) {
    return field.type.kind === 'OBJECT' ||
        (field.type.ofType &&
            (field.type.ofType.kind === 'OBJECT' || field.type.ofType.kind === 'LIST'));
};
export var createSortingKey = function (field, sort) {
    return snake(field).toUpperCase() + "_" + sort;
};
// Maps any input object to variables of a mutation. Passes certain types through a mapping process.
export var mapInputToVariables = function (input, inputType, type, typeMapper) {
    var inputFields = inputType.inputFields;
    return inputFields.reduce(function (current, next) {
        var _a, _b;
        var key = next.name;
        if (input[key] === undefined) {
            return current;
        }
        var fieldType = type.fields.find(function (field) { return fieldIsObjectOrListOfObject(field) && field.name === key; });
        if (fieldType) {
            var valueMapperForType = typeMapper[fieldType.type.ofType.name];
            if (valueMapperForType) {
                return __assign(__assign({}, current), (_a = {}, _a[key] = valueMapperForType(input[key]), _a));
            }
        }
        return __assign(__assign({}, current), (_b = {}, _b[key] = input[key], _b));
    }, {});
};
export var queryHasFilter = function (type, queryMap) {
    if (!queryMap[type]) {
        return false;
    }
    return Boolean(queryMap[type].args.find(function (f) { return f.name === 'filter'; }));
};
export var createQueryFromType = function (type, typeMap, allowedTypes) {
    return typeMap[singular(type)].fields.reduce(function (current, field) {
        // we have to skip fields that require arguments
        if (field.args && field.args.length > 0) {
            return current;
        }
        if (fieldIsObjectOrListOfObject(field)) {
            var thisType = field.type.ofType && // We also handle cases where we have e.g. [TYPE!] (List of type)
                (field.type.ofType.name ? field.type.ofType : field.type.ofType.ofType);
            var typeName = thisType && thisType.name;
            if (typeName && allowedTypes.indexOf(typeName) !== -1) {
                return "\n        " + current + " " + field.name + " {" + createQueryFromType(typeName, typeMap, allowedTypes) + " }\n        ";
            }
            if (!thisType || thisType.kind !== 'ENUM') {
                return current;
            }
        }
        return current + " " + field.name;
    }, '');
};
export var createGetManyQuery = function (type, manyLowerResourceName, resourceTypename, typeMap, queryMap, allowedTypes, idType) {
    if (!queryHasFilter(manyLowerResourceName, queryMap)) {
        return gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["query ", "{\n      ", " {\n      nodes {\n        ", "\n      }\n    }\n    }"], ["query ", "{\n      ", " {\n      nodes {\n        ", "\n      }\n    }\n    }"])), manyLowerResourceName, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, allowedTypes));
    }
    return gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    query ", "($ids: [", "!]) {\n        ", "(filter: { id: { in: $ids }}) {\n        nodes {\n            ", "\n        }\n      }\n    }"], ["\n    query ", "($ids: [", "!]) {\n        ", "(filter: { id: { in: $ids }}) {\n        nodes {\n            ", "\n        }\n      }\n    }"])), manyLowerResourceName, idType, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, allowedTypes));
};
export var createGetListQuery = function (type, manyLowerResourceName, resourceTypename, typeMap, queryMap, allowedTypes) {
    if (!queryHasFilter(manyLowerResourceName, queryMap)) {
        return gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["query ", "($offset: Int!, $first: Int!) {\n      ", "(first: $first, offset: $offset) {\n      nodes {\n        ", "\n      }\n      totalCount\n    }\n    }"], ["query ", "($offset: Int!, $first: Int!) {\n      ", "(first: $first, offset: $offset) {\n      nodes {\n        ", "\n      }\n      totalCount\n    }\n    }"])), manyLowerResourceName, manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, allowedTypes));
    }
    return gql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["query ", " (\n    $offset: Int!,\n    $first: Int!,\n    $filter: ", "Filter,\n    $orderBy: [", "OrderBy!]\n    ) {\n        ", "(first: $first, offset: $offset, filter: $filter, orderBy: $orderBy) {\n        nodes {\n            ", "\n        }\n        totalCount\n      }\n    }"], ["query ", " (\n    $offset: Int!,\n    $first: Int!,\n    $filter: ", "Filter,\n    $orderBy: [", "OrderBy!]\n    ) {\n        ", "(first: $first, offset: $offset, filter: $filter, orderBy: $orderBy) {\n        nodes {\n            ", "\n        }\n        totalCount\n      }\n    }"])), manyLowerResourceName, resourceTypename, pluralize(resourceTypename), manyLowerResourceName, createQueryFromType(resourceTypename, typeMap, allowedTypes));
};
export var createTypeMap = function (types) {
    return types.reduce(function (map, next) {
        var _a;
        return __assign(__assign({}, map), (_a = {}, _a[next.name] = next, _a));
    }, {});
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
