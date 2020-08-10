import type { IntrospectionNamedTypeRef, IntrospectionType } from 'graphql';
import type { Filter, FilterMap } from './types';
/**
 * Transforms for a certain field type a search value for a field (the key)
 * to a filter that is understood by postgraphile.
 *
 * For example:
 *
 * - type: {kind: "SCALAR", name: "String", ofType: null, __typename: "__Type"}
 * - value: "some keyword"
 * - key: "name"
 *
 * Is transformed to:
 *
 * ```ts
 * {
 *   name: {
 *     includes: "some keyword"
 *   }
 * }
 * ```
 */
export declare const mapFilterType: (type: IntrospectionNamedTypeRef, value: any, key: string) => Filter | undefined;
export declare const createFilter: (fields: {
    [key: string]: unknown;
}, type: IntrospectionType) => FilterMap | undefined;
