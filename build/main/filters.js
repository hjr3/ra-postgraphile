"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// If a filter is a scalar value, we find a default operator to map it to
const scalarDefaults = {
    // this breaks BC as the original default as equalTo or like
    string: 'includes',
    uuid: 'equalTo',
    uuidarray: 'in',
    bigint: 'equalTo',
    bigintarray: 'in',
    int: 'equalTo',
    intarray: 'in',
    fulltext: 'matches'
};
const filterMappings = {
    bigint: {
        equalTo: typeof BigInt !== 'undefined' ? BigInt : (value) => value
    },
    bigintarray: {
        in: (value) => typeof BigInt !== 'undefined' ? value.map(BigInt) : value
    },
    datetime: {
        isNull: (value) => Boolean(value)
    },
    int: {
        equalTo: Number
    },
    intarray: {
        in: (value) => value.map(Number)
    },
    intlistarray: {
        contains: (value) => value.map(Number)
    },
    string: {
        equalTo: String,
        includes: (value) => `${value}`,
        includesInsensitive: (value) => `${value}`,
        like: (value) => `${value}`,
        likeInsensitive: (value) => `${value}`
    },
    stringlistarray: {
        contains: (value) => value.map(String),
        equalTo: (value) => value.map(String)
    },
    uuid: {
        equalTo: (value) => value
    },
    uuidarray: {
        in: (value) => value
    },
    fulltext: {
        matches: (value) => `${value}:*`
    }
};
/**
 * Transforms for a certain field type a search value for a field (the key)
 * to a filter that is understood by postgraphile
 * For example
 * - type: {kind: "SCALAR", name: "String", ofType: null, __typename: "__Type"}
 * - value: "some keyword"
 * - key: "name"
 * Is transformed to:
 * {
 *   "or": [{
 *     "name": {
 *       "equalTo": "some keyword"
 *     }
 *   }, {
 *     "name": {
 *       "like": "%some keyword%"
 *     }
 *   }]
 * }
 */
exports.mapFilterType = (type, value, key) => {
    let typeName = Array.isArray(value) ? `${type.name}Array` : type.name;
    let normalizedName = typeName.toLowerCase();
    if (typeof value !== 'object') {
        const defaultOperator = scalarDefaults[normalizedName];
        if (defaultOperator === undefined) {
            throw new Error(`Filter for scalar ${value} of type ${type.name} not implemented.`);
        }
        value = { [defaultOperator]: value };
    }
    const filterMaps = Object.entries(value);
    if (filterMaps.length !== 1) {
        throw new Error('Unexpected filter specification');
    }
    const [operator, v] = filterMaps[0];
    // FIXME: i hate doing this all over again, but now that we plucked the
    // value out of the object we need to check for array again. clean this
    // up later
    typeName = Array.isArray(v) ? `${type.name}Array` : type.name;
    normalizedName = typeName.toLowerCase();
    const validOperators = filterMappings[normalizedName];
    if (!validOperators) {
        throw new Error(`No valid filter operators for type ${typeName}`);
    }
    const filterFunc = validOperators[operator];
    if (!filterFunc) {
        throw new Error(`No valid mapping for type ${typeName} and operator ${operator}`);
    }
    const filterValue = filterFunc(v);
    return {
        [key]: {
            [operator]: filterValue
        }
    };
};
exports.createFilter = (fields, type) => {
    const empty = [];
    const filters = Object.keys(fields).reduce((next, key) => {
        const maybeType = type.fields.find((f) => f.name === key);
        if (maybeType) {
            let thisType = maybeType.type.ofType || maybeType.type;
            if (maybeType.type.kind === 'LIST') {
                thisType = Object.assign(Object.assign({}, thisType), { name: `${maybeType.type.ofType.name}List` });
            }
            return [...next, exports.mapFilterType(thisType, fields[key], key)];
        }
        return next;
    }, empty);
    if (filters === empty) {
        return undefined;
    }
    return { and: filters };
};
