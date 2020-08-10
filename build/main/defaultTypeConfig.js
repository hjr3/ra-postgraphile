"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInTypeConfig = void 0;
exports.buildInTypeConfig = {
    GeometryPoint: {
        expand: true,
        queryValueToInputValue: (value) => value.geojson,
    },
    GeometryGeometry: {
        expand: true,
        queryValueToInputValue: (value) => value.geojson,
    },
    GeographyPoint: {
        expand: true,
        queryValueToInputValue: (value) => value.geojson,
    },
};
