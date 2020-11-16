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
import buildGraphQLProvider from 'ra-data-graphql';
import { buildQuery } from './buildQuery';
import { buildInTypeConfig } from './defaultTypeConfig';
export var factory = function (client, options, graphqlProviderOptions) {
    if (graphqlProviderOptions === void 0) { graphqlProviderOptions = {}; }
    var defaultAppliedOptions = {
        typeMap: __assign(__assign({}, buildInTypeConfig), ((options === null || options === void 0 ? void 0 : options.typeMap) || {})),
    };
    return buildGraphQLProvider(__assign(__assign({}, graphqlProviderOptions), { client: client,
        buildQuery: buildQuery, options: defaultAppliedOptions }));
};
