import { Factory, Response } from './types';
export declare const mapType: (idType: any, value: string | number) => string | number;
export declare const buildQuery: (introspectionResults: any, factory: Factory) => (raFetchType: string, resName: string, params: any) => {
    data: null;
    query?: undefined;
    variables?: undefined;
    parseResponse?: undefined;
} | {
    query: any;
    variables: {
        id: string | number;
        ids?: undefined;
        offset?: undefined;
        first?: undefined;
        filter?: undefined;
        orderBy?: undefined;
    };
    parseResponse: (response: Response) => {
        data: any;
    };
    data?: undefined;
} | {
    query: any;
    variables: {
        ids: any;
        id?: undefined;
        offset?: undefined;
        first?: undefined;
        filter?: undefined;
        orderBy?: undefined;
    };
    parseResponse: (response: Response) => {
        data: any;
    };
    data?: undefined;
} | {
    query: any;
    variables: {
        offset: number;
        first: any;
        filter: {
            and: object[];
        } | undefined;
        orderBy: string[];
        id?: undefined;
        ids?: undefined;
    };
    parseResponse: (response: Response) => {
        data: any;
        total: any;
    };
    data?: undefined;
} | {
    variables: {};
    query: any;
    parseResponse: (response: Response) => {
        data: any;
    };
    data?: undefined;
};
