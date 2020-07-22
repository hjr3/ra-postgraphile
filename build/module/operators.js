export var likeInsensitive = {
    // converts the input to the filter
    parse: function (value) { return ({
        likeInsensitive: value
    }); },
    // converts the filter back to the input
    format: function (obj) { return obj && obj.likeInsensitive; }
};
