var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j]
    return r
  }
// If a filter is a scalar value, we find a default operator to map it to
var scalarDefaults = {
  // this breaks BC as the original default as equalTo or like
  string: 'like',
  uuid: 'equalTo',
  uuidarray: 'in',
  bigint: 'equalTo',
  bigintarray: 'in',
  int: 'equalTo',
  intarray: 'in'
}
var filterMappings = {
  bigint: {
    equalTo:
      typeof BigInt !== 'undefined'
        ? BigInt
        : function(value) {
            return value
          }
  },
  bigintarray: {
    in: function(value) {
      return typeof BigInt !== 'undefined' ? value.map(BigInt) : value
    }
  },
  int: {
    equalTo: Number
  },
  intarray: {
    in: function(value) {
      return value.map(Number)
    }
  },
  intlistarray: {
    contains: function(value) {
      return value.map(Number)
    }
  },
  string: {
    equalTo: String,
    like: function(value) {
      return '%' + value + '%'
    },
    likeInsensitive: function(value) {
      return '%' + value + '%'
    }
  },
  stringlistarray: {
    contains: function(value) {
      return value.map(String)
    }
  },
  uuid: {
    equalTo: function(value) {
      return value
    }
  },
  uuidarray: {
    in: function(value) {
      return value
    }
  }
}
export var mapFilterType = function(type, value, key) {
  var _a, _b, _c
  var typeName = Array.isArray(value) ? type.name + 'Array' : type.name
  var normalizedName = typeName.toLowerCase()
  if (typeof value !== 'object') {
    var defaultOperator = scalarDefaults[normalizedName]
    if (defaultOperator === undefined) {
      throw new Error(
        'Filter for scalar ' +
          value +
          ' of type ' +
          type.name +
          ' not implemented.'
      )
    }
    value = ((_a = {}), (_a[defaultOperator] = value), _a)
  }
  var filterMaps = Object.entries(value)
  if (filterMaps.length !== 1) {
    throw new Error('Unexpected filter specification')
  }
  var _d = filterMaps[0],
    operator = _d[0],
    v = _d[1]
  // FIXME: i hate doing this all over again, but now that we plucked the
  // value out of the object we need to check for array again. clean this
  // up later
  typeName = Array.isArray(v) ? type.name + 'Array' : type.name
  normalizedName = typeName.toLowerCase()
  var validOperators = filterMappings[normalizedName]
  if (!validOperators) {
    throw new Error('No valid filter operators for type ' + typeName)
  }
  var filterFunc = validOperators[operator]
  if (!filterFunc) {
    throw new Error(
      'No valid mapping for type ' + typeName + ' and operator ' + operator
    )
  }
  var filterValue = filterFunc(v)
  return (
    (_b = {}), (_b[key] = ((_c = {}), (_c[operator] = filterValue), _c)), _b
  )
}
export var createFilter = function(fields, type) {
  var empty = []
  var filters = Object.keys(fields).reduce(function(next, key) {
    var maybeType = type.fields.find(function(f) {
      return f.name === key
    })
    if (maybeType) {
      var thisType = maybeType.type.ofType || maybeType.type
      if (maybeType.type.kind === 'LIST') {
        thisType = __assign(__assign({}, thisType), {
          name: maybeType.type.ofType.name + 'List'
        })
      }
      return __spreadArrays(next, [mapFilterType(thisType, fields[key], key)])
    }
    return next
  }, empty)
  if (filters === empty) {
    return undefined
  }
  return { and: filters }
}
