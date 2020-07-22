"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeInsensitive = {
    // converts the input to the filter
    parse: (value) => ({
        likeInsensitive: value
    }),
    // converts the filter back to the input
    format: (obj) => obj && obj.likeInsensitive
};
