"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = void 0;
const ra_data_graphql_1 = __importDefault(require("ra-data-graphql"));
const buildQuery_1 = require("./buildQuery");
const defaultTypeConfig_1 = require("./defaultTypeConfig");
exports.factory = (client, options, graphqlProviderOptions = {}) => {
    const defaultAppliedOptions = {
        typeMap: Object.assign(Object.assign({}, defaultTypeConfig_1.buildInTypeConfig), ((options === null || options === void 0 ? void 0 : options.typeMap) || {})),
    };
    return ra_data_graphql_1.default(Object.assign(Object.assign({}, graphqlProviderOptions), { client,
        buildQuery: buildQuery_1.buildQuery, options: defaultAppliedOptions }));
};
