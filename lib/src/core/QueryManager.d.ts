import { NetworkInterface } from '../transport/networkInterface';
import {
  QueryListener,
  ApolloQueryResult,
  ApolloExecutionResult,
  PureQueryOptions,
  FetchType,
} from './types';
import { QueryStore } from '../queries/store';
import { ApolloStore, Store, ApolloReducerConfig } from '../store';
import { NormalizedCache } from '../data/storeUtils';
import { DataProxy } from '../data/proxy';
import { FragmentMatcherInterface } from '../data/fragmentMatcher';
import { ExecutionResult, DocumentNode } from 'graphql';
import { MutationQueryReducersMap } from '../data/mutationResults';
import { MutationStore } from '../mutations/store';
import { QueryScheduler } from '../scheduler/scheduler';
import { ApolloStateSelector } from '../ApolloClient';
import { Observer, Observable } from '../util/Observable';
import { WatchQueryOptions, SubscriptionOptions } from './watchQueryOptions';
import { ObservableQuery } from './ObservableQuery';
export declare class QueryManager {
  static EMIT_REDUX_ACTIONS: boolean;
  pollingTimers: {
    [queryId: string]: any;
  };
  scheduler: QueryScheduler;
  store: ApolloStore;
  networkInterface: NetworkInterface;
  ssrMode: boolean;
  mutationStore: MutationStore;
  queryStore: QueryStore;
  private addTypename;
  private deduplicator;
  private reduxRootSelector;
  private reducerConfig;
  private queryDeduplication;
  private fragmentMatcher;
  private queryListeners;
  private queryDocuments;
  private idCounter;
  private fetchQueryPromises;
  private observableQueries;
  private queryIdsByName;
  private lastRequestId;
  private disableBroadcasting;
  constructor({
    networkInterface,
    store,
    reduxRootSelector,
    reducerConfig,
    fragmentMatcher,
    addTypename,
    queryDeduplication,
    ssrMode,
  }: {
    networkInterface: NetworkInterface;
    store: ApolloStore;
    reduxRootSelector: ApolloStateSelector;
    fragmentMatcher?: FragmentMatcherInterface;
    reducerConfig?: ApolloReducerConfig;
    addTypename?: boolean;
    queryDeduplication?: boolean;
    ssrMode?: boolean;
  });
  broadcastNewStore(store: any): void;
  mutate<T>({
    mutation,
    variables,
    optimisticResponse,
    updateQueries: updateQueriesByName,
    refetchQueries,
    update: updateWithProxyFn,
  }: {
    mutation: DocumentNode;
    variables?: Object;
    optimisticResponse?: Object | Function;
    updateQueries?: MutationQueryReducersMap<T>;
    refetchQueries?:
      | string[]
      | PureQueryOptions[]
      | ((mutationResult: Object) => string[] | PureQueryOptions[]);
    update?: (proxy: DataProxy, mutationResult: Object) => void;
  }): Promise<ApolloExecutionResult<T>>;
  fetchQuery<T>(
    queryId: string,
    options: WatchQueryOptions,
    fetchType?: FetchType,
    fetchMoreForQueryId?: string,
  ): Promise<ExecutionResult>;
  queryListenerForObserver<T>(
    queryId: string,
    options: WatchQueryOptions,
    observer: Observer<ApolloQueryResult<T>>,
  ): QueryListener;
  watchQuery<T>(
    options: WatchQueryOptions,
    shouldSubscribe?: boolean,
  ): ObservableQuery<T>;
  query<T>(options: WatchQueryOptions): Promise<ApolloQueryResult<T>>;
  generateQueryId(): string;
  stopQueryInStore(queryId: string): void;
  getApolloState(): Store;
  selectApolloState(store: any): Store;
  getInitialState(): {
    data: Object;
  };
  getDataWithOptimisticResults(): NormalizedCache;
  addQueryListener(queryId: string, listener: QueryListener): void;
  addFetchQueryPromise<T>(
    requestId: number,
    promise: Promise<ApolloQueryResult<T>>,
    resolve: (result: ApolloQueryResult<T>) => void,
    reject: (error: Error) => void,
  ): void;
  removeFetchQueryPromise(requestId: number): void;
  addObservableQuery<T>(
    queryId: string,
    observableQuery: ObservableQuery<T>,
  ): void;
  removeObservableQuery(queryId: string): void;
  resetStore(): Promise<ApolloQueryResult<any>[]>;
  startQuery<T>(
    queryId: string,
    options: WatchQueryOptions,
    listener: QueryListener,
  ): string;
  startGraphQLSubscription(options: SubscriptionOptions): Observable<any>;
  removeQuery(queryId: string): void;
  stopQuery(queryId: string): void;
  getCurrentQueryResult<T>(
    observableQuery: ObservableQuery<T>,
    isOptimistic?: boolean,
  ): any;
  getQueryWithPreviousResult<T>(
    queryIdOrObservable: string | ObservableQuery<T>,
    isOptimistic?: boolean,
  ): {
    previousResult: any;
    variables:
      | {
          [key: string]: any;
        }
      | undefined;
    document: DocumentNode;
  };
  private getQueryParts<T>(observableQuery);
  private transformQueryDocument(options);
  private getExtraReducers();
  private fetchRequest<T>({
    requestId,
    queryId,
    document,
    options,
    fetchMoreForQueryId,
  });
  private refetchQueryByName(queryName);
  private broadcastQueries();
  private generateRequestId();
}
