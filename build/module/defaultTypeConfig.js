export var buildInTypeConfig = {
    GeometryPoint: {
        expand: true,
        queryValueToInputValue: function (value) { return value.geojson; },
    },
    GeometryGeometry: {
        expand: true,
        queryValueToInputValue: function (value) { return value.geojson; },
    },
    GeographyPoint: {
        expand: true,
        queryValueToInputValue: function (value) { return value.geojson; },
    },
};
