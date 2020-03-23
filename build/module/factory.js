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
import buildGraphQLProvider from 'ra-data-graphql'
import { buildQuery } from './buildQuery'
import { defaultQueryValueToInputValueMap } from './defaultValueInputTypeMapping'
export var factory = function(client, options, graphqlProviderOptions) {
  if (options === void 0) {
    options = { queryValueToInputValueMap: {} }
  }
  if (graphqlProviderOptions === void 0) {
    graphqlProviderOptions = {}
  }
  var defaultAppliedOptions = {
    queryValueToInputValueMap: __assign(
      __assign({}, defaultQueryValueToInputValueMap),
      options.queryValueToInputValueMap || {}
    )
  }
  return buildGraphQLProvider(
    __assign(__assign({}, graphqlProviderOptions), {
      client: client,
      buildQuery: buildQuery,
      options: defaultAppliedOptions
    })
  )
}
