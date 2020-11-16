"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preparePrimaryKey = exports.stripUndefined = exports.createTypeMap = exports.createGetListQuery = exports.createGetManyQuery = exports.createQueryFromType = exports.queryHasArgument = exports.mapInputToVariables = exports.formatArgumentsAsQuery = exports.escapeIdType = exports.createSortingKey = exports.snake = exports.lowercase = exports.capitalize = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql_1 = require("graphql");
const types_1 = require("./types");
const ARGUMENT_FILTER = 'filter';
const ARGUMENT_ORDER_BY = 'orderBy';
const DEFAULT_ID_FIELD_NAME = 'id';
const NODE_ID_FIELD_NAME = 'nodeId';
exports.capitalize = (str) => str[0].toUpperCase() + str.slice(1);
exports.lowercase = (str) => str[0].toLowerCase() + str.slice(1);
exports.snake = (camelCaseInput) => camelCaseInput.replace(types_1.CAMEL_REGEX, '$1_$2');
const fieldIsObjectOrListOfObject = (field) => field.type.kind === graphql_1.TypeKind.OBJECT ||
    (field.type.ofType &&
        (field.type.ofType.kind === graphql_1.TypeKind.OBJECT || field.type.ofType.kind === graphql_1.TypeKind.LIST));
exports.createSortingKey = (field, sort) => {
    return `${exports.snake(field).toUpperCase()}_${sort.toUpperCase()}`;
};
exports.escapeIdType = (id) => String(id).replace(/-/gi, '_');
exports.formatArgumentsAsQuery = (obj, level = 0) => {
    if (typeof obj === 'number') {
        return obj;
    }
    if (Array.isArray(obj)) {
        const props = obj
            .map((value) => `${exports.formatArgumentsAsQuery(value, level + 1)}`)
            .join(',');
        return `[${props}]`;
    }
    if (typeof obj === 'object') {
        const props = Object.keys(obj)
            .map((key) => `${key}:${exports.formatArgumentsAsQuery(obj[key], level + 1)}`)
            .join(',');
        return level === 0 ? props : `{${props}}`;
    }
    return JSON.stringify(obj);
};
// Maps any input object to variables of a mutation. Passes certain types through a mapping process.
exports.mapInputToVariables = (input, inputType, type, typeConfiguration) => {
    const inputFields = inputType.inputFields;
    return inputFields.reduce((current, next) => {
        const key = next.name;
        if (input[key] === undefined) {
            return current;
        }
        const fieldType = type.fields.find((field) => fieldIsObjectOrListOfObject(field) && field.name === key);
        if (fieldType) {
            const valueMapperForType = typeConfiguration[fieldType.type.ofType.name];
            if (valueMapperForType && valueMapperForType.queryValueToInputValue) {
                return Object.assign(Object.assign({}, current), { [key]: valueMapperForType.queryValueToInputValue(input[key]) });
            }
        }
        return Object.assign(Object.assign({}, current), { [key]: input[key] });
    }, {});
};
exports.queryHasArgument = (type, argument, queryMap) => {
    if (!queryMap[type]) {
        return undefined;
    }
    return queryMap[type].args.find((f) => f.name === argument);
};
const shouldQueryField = (fieldName, typeConfig, fetchQueryType) => {
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
const applyArgumentsForField = (fieldName, typeConfig, args) => {
    if (typeConfig.computeArgumentsForField) {
        const result = typeConfig.computeArgumentsForField(fieldName, args);
        if (!result) {
            return fieldName;
        }
        return `${fieldName}(${exports.formatArgumentsAsQuery(result)})`;
    }
    return fieldName;
};
exports.createQueryFromType = (type, typeMap, typeConfiguration, primaryKey, fetchQueryType) => {
    return typeMap[type].fields.reduce((current, field) => {
        // we have to skip fields that require arguments
        const hasArguments = field.args && field.args.length > 0;
        const thisTypeConfig = typeConfiguration[type];
        // We skip fields that have arguments without type config
        if (hasArguments && !thisTypeConfig) {
            return current;
        }
        // We alias the primaryKey to `nodeId` to keep react-admin happy
        let fieldName = primaryKey.field === field && primaryKey.shouldRewrite
            ? `${DEFAULT_ID_FIELD_NAME}: ${primaryKey.idKeyName} ${primaryKey.primaryKeyName}`
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
            const extractFromNonNull = (type) => {
                return type.kind === 'NON_NULL' ? type.ofType : type;
            };
            const extractFromList = (type) => {
                return type.kind === 'LIST' ? type.ofType : type;
            };
            // Get the "base" type of this field. It can be wrapped in a few different ways:
            // - TYPE (bare type)
            // - TYPE! (non-null type)
            // - [TYPE] (list of type)
            // - [TYPE!] (list of non-null type)
            // - [TYPE!]! (non-null list of non-null type)
            const thisType = extractFromNonNull(extractFromList(extractFromNonNull(field.type)));
            const typeName = (thisType === null || thisType === void 0 ? void 0 : thisType.name) || field.type.name;
            const shouldExpand = typeName && typeConfiguration[typeName] && typeConfiguration[typeName].expand;
            if (typeName && shouldExpand) {
                return `
        ${current} ${field.name} {${exports.createQueryFromType(typeName, typeMap, typeConfiguration, primaryKey, fetchQueryType)} }
        `;
            }
            if (!thisType || thisType.kind !== graphql_1.TypeKind.ENUM) {
                return current;
            }
        }
        return `${current} ${fieldName}`;
    }, '');
};
exports.createGetManyQuery = (type, manyLowerResourceName, resourceTypename, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType) => {
    if (!exports.queryHasArgument(manyLowerResourceName, ARGUMENT_FILTER, queryMap)) {
        return graphql_tag_1.default `query ${manyLowerResourceName}{
      ${manyLowerResourceName} {
      nodes {
        ${exports.createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType)}
      }
    }
    }`;
    }
    return graphql_tag_1.default `
    query ${manyLowerResourceName}($ids: [${primaryKey.primaryKeyType.name}!]) {
      ${manyLowerResourceName}(filter: { ${primaryKey.primaryKeyName}: { in: $ids }}) {
      nodes {
        ${exports.createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType)}
      }
    }
    }`;
};
const hasOthersThenNaturalOrdering = (typeMap, orderingArgument) => {
    var _a, _b, _c, _d;
    const orderTypeName = (_b = (_a = orderingArgument === null || orderingArgument === void 0 ? void 0 : orderingArgument.ofType) === null || _a === void 0 ? void 0 : _a.ofType) === null || _b === void 0 ? void 0 : _b.name;
    return orderTypeName && ((_d = (_c = typeMap[orderTypeName]) === null || _c === void 0 ? void 0 : _c.enumValues) === null || _d === void 0 ? void 0 : _d.length) > 1;
};
exports.createGetListQuery = (type, manyLowerResourceName, resourceTypename, pluralizedResourceTypeName, typeMap, queryMap, typeConfiguration, primaryKey, fetchQueryType) => {
    const hasFilters = exports.queryHasArgument(manyLowerResourceName, ARGUMENT_FILTER, queryMap);
    const ordering = exports.queryHasArgument(manyLowerResourceName, ARGUMENT_ORDER_BY, queryMap);
    const hasOrdering = hasOthersThenNaturalOrdering(typeMap, ordering === null || ordering === void 0 ? void 0 : ordering.type);
    if (!hasFilters && !hasOrdering) {
        return graphql_tag_1.default `query ${manyLowerResourceName}($offset: Int!, $first: Int!) {
      ${manyLowerResourceName}(first: $first, offset: $offset) {
      nodes {
        ${exports.createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType)}
      }
      totalCount
    }
    }`;
    }
    if (!hasFilters && hasOrdering) {
        return graphql_tag_1.default `query ${manyLowerResourceName} (
    $offset: Int!,
    $first: Int!,
    $orderBy: [${pluralizedResourceTypeName}OrderBy!]
    ) {
      ${manyLowerResourceName}(first: $first, offset: $offset, orderBy: $orderBy) {
      nodes {
        ${exports.createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType)}
      }
      totalCount
    }
    }`;
    }
    if (hasFilters && !hasOrdering) {
        return graphql_tag_1.default `query ${manyLowerResourceName} (
    $offset: Int!,
    $first: Int!,
    $filter: ${resourceTypename}Filter,
    ) {
      ${manyLowerResourceName}(first: $first, offset: $offset, filter: $filter) {
      nodes {
        ${exports.createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType)}
      }
      totalCount
    }
    }`;
    }
    return graphql_tag_1.default `query ${manyLowerResourceName} (
  $offset: Int!,
  $first: Int!,
  $filter: ${resourceTypename}Filter,
  $orderBy: [${pluralizedResourceTypeName}OrderBy!]
  ) {
    ${manyLowerResourceName}(first: $first, offset: $offset, filter: $filter, orderBy: $orderBy) {
    nodes {
      ${exports.createQueryFromType(resourceTypename, typeMap, typeConfiguration, primaryKey, fetchQueryType)}
    }
    totalCount
  }
  }`;
};
exports.createTypeMap = (types) => {
    return types.reduce((map, next) => {
        return Object.assign(Object.assign({}, map), { [next.name]: next });
    }, {});
};
exports.stripUndefined = (variables) => Object.keys(variables).reduce((next, key) => {
    if (variables[key] === undefined) {
        return next;
    }
    return Object.assign(Object.assign({}, next), { [key]: variables[key] });
}, {});
const findTypeByName = (type, name) => { var _a; return (_a = type.fields) === null || _a === void 0 ? void 0 : _a.find((thisType) => thisType.name === name); };
exports.preparePrimaryKey = (query, resourceName, resourceTypename, type) => {
    var _a, _b, _c;
    // in case we don't have any arguments we fall back to the default `id` type.
    const primaryKeyName = ((_a = query === null || query === void 0 ? void 0 : query.args[0]) === null || _a === void 0 ? void 0 : _a.name) || DEFAULT_ID_FIELD_NAME;
    const field = findTypeByName(type, primaryKeyName);
    let primaryKeyType = field === null || field === void 0 ? void 0 : field.type;
    if (!primaryKeyType || !primaryKeyName) {
        throw new Error(`Could not determine primaryKey on type ${resourceTypename} field.
      Please add a primary key to ${resourceTypename}`);
    }
    if ((_b = primaryKeyType) === null || _b === void 0 ? void 0 : _b.ofType) {
        primaryKeyType = (_c = primaryKeyType) === null || _c === void 0 ? void 0 : _c.ofType;
    }
    if (primaryKeyName !== DEFAULT_ID_FIELD_NAME) {
        return {
            field: field,
            idKeyName: NODE_ID_FIELD_NAME,
            primaryKeyName,
            primaryKeyType: primaryKeyType,
            getResourceName: `${resourceName}ByNodeId`,
            deleteResourceName: `delete${resourceTypename}ByNodeId`,
            updateResourceName: `update${resourceTypename}ByNodeId`,
            shouldRewrite: true,
        };
    }
    return {
        field: field,
        idKeyName: DEFAULT_ID_FIELD_NAME,
        primaryKeyName,
        primaryKeyType: primaryKeyType,
        getResourceName: `${resourceName}`,
        deleteResourceName: `delete${resourceTypename}`,
        updateResourceName: `update${resourceTypename}`,
        shouldRewrite: false,
    };
};
