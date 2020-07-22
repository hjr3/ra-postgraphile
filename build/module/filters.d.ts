/**
 * Transforms for a certain field type a search value for a field (the key)
 * to a filter that is understood by postgraphile
 * For example
 * - type: {kind: "SCALAR", name: "String", ofType: null, __typename: "__Type"}
 * - value: "some keyword"
 * - key: "name"
 * Is transformed to:
 * {
 *   "or": [{
 *     "name": {
 *       "equalTo": "some keyword"
 *     }
 *   }, {
 *     "name": {
 *       "like": "%some keyword%"
 *     }
 *   }]
 * }
 */
export declare const mapFilterType: (type: any, value: any, key: string) => {
    [x: string]: {
        [x: string]: any;
    };
};
export declare const createFilter: (fields: any, type: any) => {
    and: object[];
} | undefined;
