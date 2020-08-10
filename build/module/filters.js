var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
export var mapFilterType = function (type, value, key) {
    var _a, _b;
    var _c;
    if (Array.isArray(value)) {
        var spec = {
            operator: 'in',
            value: value,
        };
        value = spec;
    }
    if (typeof value !== 'object') {
        var typeName = ((_c = type === null || type === void 0 ? void 0 : type.name) !== null && _c !== void 0 ? _c : '').toLowerCase();
        var operator_1 = 'equalTo';
        // string uses includes a the default operator for historical reasons
        if (typeName === 'string') {
            operator_1 = 'includes';
        }
        // a type of FullText uses matches a the default operator for historical reasons
        if (typeName === 'fulltext') {
            operator_1 = 'matches';
            value = value + ":*";
        }
        var spec = {
            operator: operator_1,
            value: value,
        };
        value = spec;
    }
    else {
        // make sure object has a shape of FilterSpec
        if ((value === null || value === void 0 ? void 0 : value.operator) === undefined) {
            throw new Error("Alternative " + JSON.stringify(value) + " filter is not of type FilterSpec");
        }
    }
    var operator = value.operator, v = value.value;
    // react-admin sends the value as undefined when the filter is cleared
    // rather than making every parse function handle that, deal with it here
    if (v === undefined) {
        return undefined;
    }
    return _a = {},
        _a[key] = (_b = {},
            _b[operator] = v,
            _b),
        _a;
};
export var createFilter = function (fields, type) {
    var empty = [];
    var filters = Object.keys(fields).reduce(function (next, key) {
        var maybeType = type.fields.find(function (f) { return f.name === key; });
        if (maybeType) {
            var thisType = maybeType.type.ofType || maybeType.type;
            var filter = mapFilterType(thisType, fields[key], key);
            if (filter === undefined) {
                return next;
            }
            return __spreadArrays(next, [filter]);
        }
        return next;
    }, empty);
    if (filters === empty) {
        return undefined;
    }
    return { and: filters };
};
