import type { IntrospectionType, IntrospectionField, IntrospectionInputValue } from 'graphql';
import { IntrospectionNamedTypeRef, IntrospectionOutputType } from 'graphql/utilities/introspectionQuery';
import { Query, QueryMap, SortDirection, TypeConfigMap, TypeMap, FetchQueryType } from './types';
export declare const capitalize: (str: string) => string;
export declare const lowercase: (str: string) => string;
export declare const snake: (camelCaseInput: string) => string;
export declare const createSortingKey: (field: string, sort: SortDirection) => string;
export declare const escapeIdType: (id: any) => string;
export declare const formatArgumentsAsQuery: (obj: any, level?: number) => string | number;
export declare const mapInputToVariables: (input: any, inputType: any, type: any, typeConfiguration: TypeConfigMap) => any;
export declare const queryHasArgument: (type: string, argument: string, queryMap: QueryMap) => IntrospectionInputValue | undefined;
export declare const createQueryFromType: (type: string, typeMap: TypeMap, typeConfiguration: TypeConfigMap, primaryKey: PrimaryKey, fetchQueryType: FetchQueryType) => string;
export declare const createGetManyQuery: (type: any, manyLowerResourceName: string, resourceTypename: string, typeMap: any, queryMap: QueryMap, typeConfiguration: TypeConfigMap, primaryKey: PrimaryKey, fetchQueryType: FetchQueryType) => import("graphql").DocumentNode;
export declare const createGetListQuery: (type: IntrospectionType, manyLowerResourceName: string, resourceTypename: string, pluralizedResourceTypeName: string, typeMap: TypeMap, queryMap: QueryMap, typeConfiguration: TypeConfigMap, primaryKey: PrimaryKey, fetchQueryType: FetchQueryType) => import("graphql").DocumentNode;
export declare const createTypeMap: (types: ReadonlyArray<IntrospectionType>) => {};
export declare const stripUndefined: <T extends Record<string, any>>(variables: T) => {};
export interface PrimaryKey {
    idKeyName: string;
    primaryKeyType: IntrospectionNamedTypeRef<IntrospectionOutputType>;
    field: IntrospectionField;
    primaryKeyName: string;
    getResourceName: string;
    deleteResourceName: string;
    updateResourceName: string;
    shouldRewrite: boolean;
}
export declare const preparePrimaryKey: (query: Query | undefined, resourceName: string, resourceTypename: string, type: IntrospectionType) => PrimaryKey;
