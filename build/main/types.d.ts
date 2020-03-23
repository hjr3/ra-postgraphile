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
export declare type SortDirection = 'ASC' | 'DESC'
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
  sort: {
    field: string
    order: SortDirection
  }
  target: string
  id: number
  pagination: {
    page: number
    perPage: number
  }
}
export interface Response {
  data: any
}
export interface ScalarDefaults {
  [type: string]: string
}
export interface FilterMappings {
  [type: string]: {
    [operator: string]: any
  }
}
export interface Contains {
  contains: any
}
export interface EqualTo {
  equalTo: any
}
export interface Like {
  like: any
}
export interface LikeInsensitive {
  likeInsensitive: any
}
export declare const CAMEL_REGEX: RegExp
export declare const NATURAL_SORTING = 'NATURAL'
export declare const VERB_GET_ONE = 'GET_ONE'
export declare const VERB_GET_MANY = 'GET_MANY'
export declare const VERB_GET_MANY_REFERENCE = 'GET_MANY_REFERENCE'
export declare const VERB_GET_LIST = 'GET_LIST'
export declare const VERB_CREATE = 'CREATE'
export declare const VERB_DELETE = 'DELETE'
export declare const VERB_DELETE_MANY = 'DELETE_MANY'
export declare const VERB_UPDATE = 'UPDATE'
export declare const VERB_UPDATE_MANY = 'UPDATE_MANY'
