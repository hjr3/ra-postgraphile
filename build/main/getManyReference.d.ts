import { IntrospectionType } from 'graphql';
import type { GetManyReferenceParams } from 'ra-core';
import { QueryMap, Response, TypeConfigMap, TypeMap, FetchQueryType } from './types';
import { PrimaryKey } from './utils';
export declare const getManyReference: (params: GetManyReferenceParams, type: IntrospectionType, manyLowerResourceName: string, resourceTypename: string, pluralizedResourceTypeName: string, typeMap: TypeMap, queryMap: QueryMap, typeConfiguration: TypeConfigMap, primaryKey: PrimaryKey, fetchQueryType: FetchQueryType) => {
    query: import("graphql").DocumentNode;
    variables: {
        offset: number;
        first: number;
        filter: import("./types").FilterMap | undefined;
        orderBy: string[];
    };
    parseResponse: (response: Response) => {
        data: any;
        total: any;
    };
};
