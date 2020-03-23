import { QueryInputTypeMapper, QueryMap, SortDirection } from './types'
export declare const capitalize: (str: string) => string
export declare const lowercase: (str: string) => string
export declare const snake: (camelCaseInput: string) => string
export declare const createSortingKey: (
  field: string,
  sort: SortDirection
) => string
export declare const mapInputToVariables: (
  input: any,
  inputType: any,
  type: any,
  typeMapper: QueryInputTypeMapper
) => any
export declare const queryHasFilter: (
  type: string,
  queryMap: QueryMap
) => boolean
export declare const createQueryFromType: (
  type: string,
  typeMap: any,
  allowedTypes: string[]
) => any
export declare const createGetManyQuery: (
  type: any,
  manyLowerResourceName: string,
  resourceTypename: string,
  typeMap: any,
  queryMap: QueryMap,
  allowedTypes: string[],
  idType: string
) => any
export declare const createGetListQuery: (
  type: any,
  manyLowerResourceName: string,
  resourceTypename: string,
  typeMap: any,
  queryMap: QueryMap,
  allowedTypes: string[]
) => any
export declare const createTypeMap: (types: any[]) => any
