import { ManyReferenceParams, QueryMap, Response } from './types';
export declare const getManyReference: (params: ManyReferenceParams, type: object, manyLowerResourceName: string, resourceTypename: string, typeMap: object, queryMap: QueryMap, allowedTypes: string[]) => {
    query: any;
    variables: {
        offset: number;
        first: number;
        filter: {
            and: object[];
        } | undefined;
        orderBy: string[];
    };
    parseResponse: (response: Response) => {
        data: any;
        total: any;
    };
};
