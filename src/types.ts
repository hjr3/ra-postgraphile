import { GraphQLObjectType } from 'graphql'

export interface QueryInputTypeMapper {
  [id: string]: (value: any) => any
}

export interface ProviderOptions {
  /**
   * It's possible that a type has a different shape when a Query is used then when the Input/Patch is used
   */
  queryValueToInputValueMap: QueryInputTypeMapper
}

export interface GraphqlProviderOptions {
  introspection?: {
    queryType: {
      name: string
    }
    mutationType: {
      name: string
    }
    types: GraphQLObjectType[]
  }
}

export interface Factory {
  options: ProviderOptions
  graphqlOptions: GraphqlProviderOptions
}

export type SortDirection = 'ASC' | 'DESC'

export interface UpdateManyParams {
  ids: Array<number | string>
  data: any
}

export interface QueryMap {
  [query: string]: {
    args: Array<{
      name: string
    }>
  }
}

export interface ManyReferenceParams {
  filter: any
  sort: { field: string; order: SortDirection }
  target: string
  id: number
  pagination: { page: number; perPage: number }
}

export interface Response {
  data: any
}

// Copied from https://github.com/graphile-contrib/postgraphile-plugin-connection-filter/blob/master/src/PgConnectionArgFilterOperatorsPlugin.js#L42-L277
export type Operator =
  // Standard Operators
  | 'isNull'
  | 'equalTo'
  | 'notEqualTo'
  | 'distinctFrom'
  | 'notDistinctFrom'
  | 'in'
  | 'notIn'

  // Pattern Matching Operators
  | 'includes'
  | 'notIncludes'
  | 'includesInsensitive'
  | 'notIncludesInsensitive'
  | 'startsWith'
  | 'notStartsWith'
  | 'startsWithInsensitive'
  | 'notStartsWithInsensitive'
  | 'endsWith'
  | 'notEndsWith'
  | 'endsWithInsensitive'
  | 'notEndsWithInsensitive'
  | 'like'
  | 'notLike'
  | 'likeInsensitive'
  | 'notLikeInsensitive'

  // HStore / JSON / INET Operators
  | 'contains'
  | 'containsKey'
  | 'containsAllKeys'
  | 'containsAnyKeys'
  | 'containedBy'
  | 'containedByOrEqualTo'
  | 'containsOrContainedBy'

  // operators not mentioned in postgraphile-plugin-connection-filter
  | 'matches'

export interface FilterSpec {
  operator: Operator
  value: any
}

export interface Filter {
  [key: string]: {
    [operator: string]: any
  }
}

export interface FilterMap {
  and: Filter[]
}

export interface FieldType {
  kind: string
  name: string | null
  ofType: FieldType | null
}

export interface IntrospectionResource {
  fields: {
    name: string
    type: FieldType
  }[]
}

// Constants

export const CAMEL_REGEX = /(.+?)([A-Z])/gm

export const NATURAL_SORTING = 'NATURAL'

export const VERB_GET_ONE = 'GET_ONE'
export const VERB_GET_MANY = 'GET_MANY'
export const VERB_GET_MANY_REFERENCE = 'GET_MANY_REFERENCE'
export const VERB_GET_LIST = 'GET_LIST'
export const VERB_CREATE = 'CREATE'
export const VERB_DELETE = 'DELETE'
export const VERB_DELETE_MANY = 'DELETE_MANY'
export const VERB_UPDATE = 'UPDATE'
export const VERB_UPDATE_MANY = 'UPDATE_MANY'
