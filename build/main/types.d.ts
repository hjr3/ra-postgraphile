import type { IntrospectionInputValue, IntrospectionSchema, IntrospectionType } from 'graphql';
export interface TypeConfig {
    /**
     * Allows you to map the value if used as an input type for mutations
     *
     * Some values might not convert 1:1 if returned from the query and used as an input
     */
    queryValueToInputValue?: (value: any) => any;
    /**
     * Allows you to exclude certain fields, either by passing an array (e.g. `['field1', 'field2']`) or a function
     *
     * By default all `Scalar`s, `Enum`s and `List<Scalar|Enum>.` are queried.
     * If you have expansive computations that you don't want to expose to `react-admin`, this is the
     * perfect place to do so :).
     */
    excludeFields?: string[] | ((fieldName: string) => boolean);
    /**
     * Same as exclude fields, but if provided will let you dynamically decide if a field is queried.
     * Will only pass fields of type `Scalar`, `Enum` and `List<Scalar|Enum>.`
     * You can only provide either `includeFields` or `excludeFields`.
     */
    includeFields?: string[] | ((fieldName: string) => boolean);
    /**
     * Allows you to dynamically provide arguments for a given field
     */
    computeArgumentsForField?: (fieldName: string, args: ReadonlyArray<IntrospectionInputValue>) => Record<string, any> | null;
    /**
     * Will expand this type, by default only `Scalar`s, `Enum`s and `List<Scalar|Enum>.` are expanded.
     * Make sure you expand subtypes as well if required.
     */
    expand?: boolean;
}
export interface TypeConfigMap {
    [type: string]: TypeConfig;
}
export interface ProviderOptions {
    typeMap: TypeConfigMap;
}
export interface GraphqlProviderOptions {
    introspection?: {
        schema: IntrospectionSchema;
    };
}
export interface Factory {
    options: ProviderOptions;
    graphqlOptions: GraphqlProviderOptions;
}
export declare type SortDirection = 'ASC' | 'DESC';
export interface Query {
    args: Array<IntrospectionInputValue>;
}
export interface QueryMap {
    [query: string]: Query;
}
export interface TypeMap {
    [type: string]: IntrospectionType;
}
export interface Response {
    data: any;
}
export declare type Operator = 'isNull' | 'equalTo' | 'notEqualTo' | 'distinctFrom' | 'notDistinctFrom' | 'in' | 'notIn' | 'includes' | 'notIncludes' | 'includesInsensitive' | 'notIncludesInsensitive' | 'startsWith' | 'notStartsWith' | 'startsWithInsensitive' | 'notStartsWithInsensitive' | 'endsWith' | 'notEndsWith' | 'endsWithInsensitive' | 'notEndsWithInsensitive' | 'like' | 'notLike' | 'likeInsensitive' | 'notLikeInsensitive' | 'contains' | 'containsKey' | 'containsAllKeys' | 'containsAnyKeys' | 'containedBy' | 'containedByOrEqualTo' | 'containsOrContainedBy' | 'matches';
export interface FilterSpec {
    operator: Operator;
    value: any;
}
export interface Filter {
    [key: string]: {
        [operator: string]: any;
    };
}
export interface FilterMap {
    and: Filter[];
}
export declare const CAMEL_REGEX: RegExp;
export declare const NATURAL_SORTING = "NATURAL";
