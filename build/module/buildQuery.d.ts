import type { IntrospectionNamedTypeRef, IntrospectionSchema, IntrospectionType } from 'graphql';
import type { GetManyReferenceParams, UpdateManyParams, CreateParams, DeleteManyParams, GetListParams, GetManyParams, GetOneParams, DeleteParams, ListParams, UpdateParams } from 'ra-core';
import { Factory, Response } from './types';
export declare const mapType: (idType: IntrospectionNamedTypeRef<any>, value: string | number) => string | number;
declare type IntrospectionResult = {
    schema: IntrospectionSchema;
    types: ReadonlyArray<IntrospectionType>;
    queries: Array<any>;
    resources: Array<any>;
};
declare type AllParams = GetOneParams | GetManyReferenceParams | UpdateManyParams | CreateParams | DeleteManyParams | GetListParams | GetManyParams | DeleteParams | ListParams | UpdateParams;
export declare const buildQuery: (introspectionResults: IntrospectionResult, factory: Factory) => (raFetchType: string, resName: string, params: AllParams) => {
    data: null;
    query?: undefined;
    variables?: undefined;
    parseResponse?: undefined;
} | {
    query: import("graphql").DocumentNode;
    variables: {
        id: string | number;
        ids?: undefined;
    };
    parseResponse: (response: Response) => {
        data: any;
    };
    data?: undefined;
} | {
    query: import("graphql").DocumentNode;
    variables: {
        ids: (string | number)[];
        id?: undefined;
    };
    parseResponse: (response: Response) => {
        data: any;
    };
    data?: undefined;
} | {
    query: import("graphql").DocumentNode;
    variables: {};
    parseResponse: (response: Response) => {
        data: any;
        total: any;
    };
    data?: undefined;
} | {
    variables: {
        input: {
            [x: string]: any;
        };
    };
    query: import("graphql").DocumentNode;
    parseResponse: (response: Response) => {
        data: any;
    };
    data?: undefined;
} | {
    variables: {};
    query: import("graphql").DocumentNode;
    parseResponse: (response: Response) => {
        data: (string | number)[];
    };
    data?: undefined;
};
export {};
