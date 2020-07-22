"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ra_data_graphql_1 = __importDefault(require("ra-data-graphql"));
const buildQuery_1 = require("./buildQuery");
const defaultValueInputTypeMapping_1 = require("./defaultValueInputTypeMapping");
exports.factory = (client, options = { queryValueToInputValueMap: {} }, graphqlProviderOptions = {}) => {
    const defaultAppliedOptions = {
        queryValueToInputValueMap: Object.assign(Object.assign({}, defaultValueInputTypeMapping_1.defaultQueryValueToInputValueMap), (options.queryValueToInputValueMap || {}))
    };
    return ra_data_graphql_1.default(Object.assign(Object.assign({}, graphqlProviderOptions), { client,
        buildQuery: buildQuery_1.buildQuery, options: defaultAppliedOptions }));
};
