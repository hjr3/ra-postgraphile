export var defaultQueryValueToInputValueMap = {
    GeometryPoint: function (value) { return value.geojson; },
    GeometryGeometry: function (value) { return value.geojson; },
    GeographyPoint: function (value) { return value.geojson; }
};
