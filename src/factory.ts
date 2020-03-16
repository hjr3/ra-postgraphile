import buildGraphQLProvider from 'ra-data-graphql'
import { buildQuery } from './buildQuery'
import { defaultQueryValueToInputValueMap } from './defaultValueInputTypeMapping'
import { ProviderOptions } from './types'

export const factory = (
  client: any,
  options: ProviderOptions = { queryValueToInputValueMap: {} },
  introspection?: any
) => {
  const defaultAppliedOptions = {
    queryValueToInputValueMap: {
      ...defaultQueryValueToInputValueMap,
      ...(options.queryValueToInputValueMap || {})
    }
  }

  return buildGraphQLProvider({
    client,
    buildQuery,
    options: defaultAppliedOptions,
    introspection
  })
}
