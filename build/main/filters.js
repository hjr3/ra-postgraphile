"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFilter = exports.mapFilterType = void 0;
/**
 * Transforms for a certain field type a search value for a field (the key)
 * to a filter that is understood by postgraphile.
 *
 * For example:
 *
 * - type: {kind: "SCALAR", name: "String", ofType: null, __typename: "__Type"}
 * - value: "some keyword"
 * - key: "name"
 *
 * Is transformed to:
 *
 * ```ts
 * {
 *   name: {
 *     includes: "some keyword"
 *   }
 * }
 * ```
 */
exports.mapFilterType = (type, value, key) => {
    var _a;
    if (Array.isArray(value)) {
        const spec = {
            operator: 'in',
            value,
        };
        value = spec;
    }
    if (typeof value !== 'object') {
        const typeName = ((_a = type === null || type === void 0 ? void 0 : type.name) !== null && _a !== void 0 ? _a : '').toLowerCase();
        let operator = 'equalTo';
        // string uses includes a the default operator for historical reasons
        if (typeName === 'string') {
            operator = 'includes';
        }
        // a type of FullText uses matches a the default operator for historical reasons
        if (typeName === 'fulltext') {
            operator = 'matches';
            value = `${value}:*`;
        }
        const spec = {
            operator,
            value,
        };
        value = spec;
    }
    else {
        // make sure object has a shape of FilterSpec
        if ((value === null || value === void 0 ? void 0 : value.operator) === undefined) {
            throw new Error(`Alternative ${JSON.stringify(value)} filter is not of type FilterSpec`);
        }
    }
    const { operator, value: v } = value;
    // react-admin sends the value as undefined when the filter is cleared
    // rather than making every parse function handle that, deal with it here
    if (v === undefined) {
        return undefined;
    }
    return {
        [key]: {
            [operator]: v,
        },
    };
};
exports.createFilter = (fields, type) => {
    const empty = [];
    const filters = Object.keys(fields).reduce((next, key) => {
        const maybeType = type.fields.find((f) => f.name === key);
        if (maybeType) {
            const thisType = maybeType.type.ofType || maybeType.type;
            const filter = exports.mapFilterType(thisType, fields[key], key);
            if (filter === undefined) {
                return next;
            }
            return [...next, filter];
        }
        return next;
    }, empty);
    if (filters === empty) {
        return undefined;
    }
    return { and: filters };
};
