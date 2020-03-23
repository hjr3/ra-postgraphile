'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.defaultQueryValueToInputValueMap = {
  GeometryPoint: value => value.geojson,
  GeometryGeometry: value => value.geojson,
  GeographyPoint: value => value.geojson
}
