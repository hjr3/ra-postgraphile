import type { ApolloClient } from 'apollo-client';
import type { LegacyDataProvider } from 'ra-core';
import { ProviderOptions, GraphqlProviderOptions } from './types';
export declare const factory: <T = any>(client: ApolloClient<T>, options?: ProviderOptions | undefined, graphqlProviderOptions?: GraphqlProviderOptions) => LegacyDataProvider;
