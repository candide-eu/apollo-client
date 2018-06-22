import { assert } from 'chai';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
import { createApolloStore } from '../src/store';
import { ReduxDataProxy, TransactionDataProxy } from '../src/data/proxy';
import { toIdValue } from '../src/data/storeUtils';
import { HeuristicFragmentMatcher } from '../src/data/fragmentMatcher';
import { addTypenameToDocument } from '../src/queries/queryTransform';
import { getOperationName } from '../src/queries/getFromAST';
describe('ReduxDataProxy', function () {
    function createDataProxy(_a) {
        var _b = _a === void 0 ? {} : _a, initialState = _b.initialState, config = _b.config;
        var store = createApolloStore({
            initialState: initialState,
            config: config,
        });
        var fm = new HeuristicFragmentMatcher();
        return new ReduxDataProxy(store, function (_a) {
            var apollo = _a.apollo;
            return apollo;
        }, fm, config || {});
    }
    describe('readQuery', function () {
        it('will read some data from the store', function () {
            var proxy = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                a: 1,
                                b: 2,
                                c: 3,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            {\n              a\n            }\n          "], _a.raw = ["\n            {\n              a\n            }\n          "], gql(_a)),
            }), { a: 1 });
            assert.deepEqual(proxy.readQuery({
                query: (_b = ["\n            {\n              b\n              c\n            }\n          "], _b.raw = ["\n            {\n              b\n              c\n            }\n          "], gql(_b)),
            }), { b: 2, c: 3 });
            assert.deepEqual(proxy.readQuery({
                query: (_c = ["\n            {\n              a\n              b\n              c\n            }\n          "], _c.raw = ["\n            {\n              a\n              b\n              c\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
        it('will read some deeply nested data from the store', function () {
            var proxy = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                a: 1,
                                b: 2,
                                c: 3,
                                d: {
                                    type: 'id',
                                    id: 'foo',
                                    generated: false,
                                },
                            },
                            foo: {
                                e: 4,
                                f: 5,
                                g: 6,
                                h: {
                                    type: 'id',
                                    id: 'bar',
                                    generated: false,
                                },
                            },
                            bar: {
                                i: 7,
                                j: 8,
                                k: 9,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], _a.raw = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], gql(_a)),
            }), { a: 1, d: { e: 4 } });
            assert.deepEqual(proxy.readQuery({
                query: (_b = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], _b.raw = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], gql(_b)),
            }), { a: 1, d: { e: 4, h: { i: 7 } } });
            assert.deepEqual(proxy.readQuery({
                query: (_c = ["\n            {\n              a\n              b\n              c\n              d {\n                e\n                f\n                g\n                h {\n                  i\n                  j\n                  k\n                }\n              }\n            }\n          "], _c.raw = ["\n            {\n              a\n              b\n              c\n              d {\n                e\n                f\n                g\n                h {\n                  i\n                  j\n                  k\n                }\n              }\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3, d: { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } } });
            var _a, _b, _c;
        });
        it('will read data using custom resolvers', function () {
            var proxy = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                __typename: 'Query',
                            },
                            foo: {
                                id: 'foo',
                                a: 1,
                                b: '2',
                                c: null,
                            },
                        },
                    },
                },
                config: {
                    dataIdFromObject: function (object) { return object.id; },
                    customResolvers: {
                        Query: {
                            thing: function (_, args) { return toIdValue(args.id); },
                        },
                    },
                },
            });
            var queryResult = proxy.readQuery({
                query: (_a = ["\n          query {\n            thing(id: \"foo\") {\n              a\n              b\n              c\n            }\n          }\n        "], _a.raw = ["\n          query {\n            thing(id: \"foo\") {\n              a\n              b\n              c\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(queryResult, {
                thing: { a: 1, b: '2', c: null },
            });
            var _a;
        });
        it('will read some data from the store with variables', function () {
            var proxy = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                'field({"literal":true,"value":42})': 1,
                                'field({"literal":false,"value":42})': 2,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { a: 1, b: 2 });
            var _a;
        });
    });
    describe('readFragment', function () {
        it('will throw an error when there is no fragment', function () {
            var proxy = createDataProxy();
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            query {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            query {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            schema {\n              query: Query\n            }\n          "], _a.raw = ["\n            schema {\n              query: Query\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will throw an error when there is more than one fragment but no fragment name', function () {
            var proxy = createDataProxy();
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will read some deeply nested data from the store at any id', function () {
            var proxy = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                __typename: 'Type1',
                                a: 1,
                                b: 2,
                                c: 3,
                                d: {
                                    type: 'id',
                                    id: 'foo',
                                    generated: false,
                                },
                            },
                            foo: {
                                __typename: 'Foo',
                                e: 4,
                                f: 5,
                                g: 6,
                                h: {
                                    type: 'id',
                                    id: 'bar',
                                    generated: false,
                                },
                            },
                            bar: {
                                __typename: 'Bar',
                                i: 7,
                                j: 8,
                                k: 9,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], _a.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], gql(_a)),
            }), { e: 4, h: { i: 7 } });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_b = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], _b.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], gql(_b)),
            }), { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_c = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], _c.raw = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], gql(_c)),
            }), { i: 7 });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_d = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _d.raw = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_d)),
            }), { i: 7, j: 8, k: 9 });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_e = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _e.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_e)),
                fragmentName: 'fragmentFoo',
            }), { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_f = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _f.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_f)),
                fragmentName: 'fragmentBar',
            }), { i: 7, j: 8, k: 9 });
            var _a, _b, _c, _d, _e, _f;
        });
        it('will read some data from the store with variables', function () {
            var proxy = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            foo: {
                                __typename: 'Foo',
                                'field({"literal":true,"value":42})': 1,
                                'field({"literal":false,"value":42})': 2,
                            },
                        },
                    },
                },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { a: 1, b: 2 });
            var _a;
        });
        it('will return null when an id that can’t be found is provided', function () {
            var client1 = createDataProxy();
            var client2 = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            bar: { __typename: 'Bar', a: 1, b: 2, c: 3 },
                        },
                    },
                },
            });
            var client3 = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            foo: { __typename: 'Foo', a: 1, b: 2, c: 3 },
                        },
                    },
                },
            });
            assert.equal(client1.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
            }), null);
            assert.equal(client2.readFragment({
                id: 'foo',
                fragment: (_b = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _b.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_b)),
            }), null);
            assert.deepEqual(client3.readFragment({
                id: 'foo',
                fragment: (_c = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _c.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
        it('will read data using custom resolvers', function () {
            var proxy = createDataProxy({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                __typename: 'Query',
                            },
                            foo: {
                                __typename: 'Query',
                                id: 'foo',
                            },
                            bar: {
                                __typename: 'Thing',
                                id: 'foo',
                                a: 1,
                                b: '2',
                                c: null,
                            },
                        },
                    },
                },
                config: {
                    dataIdFromObject: function (object) { return object.id; },
                    customResolvers: {
                        Query: {
                            thing: function (_, args) { return toIdValue(args.id); },
                        },
                    },
                },
            });
            var queryResult = proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n          fragment fooFragment on Query {\n            thing(id: \"bar\") {\n              a\n              b\n              c\n            }\n          }\n        "], _a.raw = ["\n          fragment fooFragment on Query {\n            thing(id: \"bar\") {\n              a\n              b\n              c\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(queryResult, {
                thing: { a: 1, b: '2', c: null },
            });
            var _a;
        });
    });
    describe('writeQuery', function () {
        it('will write some data to the store', function () {
            var proxy = createDataProxy();
            proxy.writeQuery({
                data: { a: 1 },
                query: (_a = ["\n          {\n            a\n          }\n        "], _a.raw = ["\n          {\n            a\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                },
            });
            proxy.writeQuery({
                data: { b: 2, c: 3 },
                query: (_b = ["\n          {\n            b\n            c\n          }\n        "], _b.raw = ["\n          {\n            b\n            c\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                },
            });
            proxy.writeQuery({
                data: { a: 4, b: 5, c: 6 },
                query: (_c = ["\n          {\n            a\n            b\n            c\n          }\n        "], _c.raw = ["\n          {\n            a\n            b\n            c\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 4,
                    b: 5,
                    c: 6,
                },
            });
            var _a, _b, _c;
        });
        it('will write some deeply nested data to the store', function () {
            var proxy = createDataProxy();
            proxy.writeQuery({
                data: { a: 1, d: { e: 4 } },
                query: (_a = ["\n          {\n            a\n            d {\n              e\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            d {\n              e\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    e: 4,
                },
            });
            proxy.writeQuery({
                data: { a: 1, d: { h: { i: 7 } } },
                query: (_b = ["\n          {\n            a\n            d {\n              h {\n                i\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            a\n            d {\n              h {\n                i\n              }\n            }\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    e: 4,
                    h: {
                        type: 'id',
                        id: '$ROOT_QUERY.d.h',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d.h': {
                    i: 7,
                },
            });
            proxy.writeQuery({
                data: {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } },
                },
                query: (_c = ["\n          {\n            a\n            b\n            c\n            d {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          }\n        "], _c.raw = ["\n          {\n            a\n            b\n            c\n            d {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: '$ROOT_QUERY.d.h',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d.h': {
                    i: 7,
                    j: 8,
                    k: 9,
                },
            });
            var _a, _b, _c;
        });
        it('will write some data to the store with variables', function () {
            var proxy = createDataProxy();
            proxy.writeQuery({
                data: {
                    a: 1,
                    b: 2,
                },
                query: (_a = ["\n          query($literal: Boolean, $value: Int) {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], _a.raw = ["\n          query($literal: Boolean, $value: Int) {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                ROOT_QUERY: {
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            });
            var _a;
        });
    });
    describe('writeFragment', function () {
        it('will throw an error when there is no fragment', function () {
            var proxy = createDataProxy();
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            query {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            query {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            schema {\n              query: Query\n            }\n          "], _a.raw = ["\n            schema {\n              query: Query\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will throw an error when there is more than one fragment but no fragment name', function () {
            var proxy = createDataProxy();
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                proxy.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will write some deeply nested data into the store at any id', function () {
            var proxy = createDataProxy({
                config: { dataIdFromObject: function (o) { return o.id; } },
            });
            proxy.writeFragment({
                data: { __typename: 'Foo', e: 4, h: { id: 'bar', i: 7 } },
                id: 'foo',
                fragment: (_a = ["\n          fragment fragmentFoo on Foo {\n            e\n            h {\n              i\n            }\n          }\n        "], _a.raw = ["\n          fragment fragmentFoo on Foo {\n            e\n            h {\n              i\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                foo: {
                    e: 4,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 7,
                },
            });
            proxy.writeFragment({
                data: { __typename: 'Foo', f: 5, g: 6, h: { id: 'bar', j: 8, k: 9 } },
                id: 'foo',
                fragment: (_b = ["\n          fragment fragmentFoo on Foo {\n            f\n            g\n            h {\n              j\n              k\n            }\n          }\n        "], _b.raw = ["\n          fragment fragmentFoo on Foo {\n            f\n            g\n            h {\n              j\n              k\n            }\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 7,
                    j: 8,
                    k: 9,
                },
            });
            proxy.writeFragment({
                data: { i: 10, __typename: 'Bar' },
                id: 'bar',
                fragment: (_c = ["\n          fragment fragmentBar on Bar {\n            i\n          }\n        "], _c.raw = ["\n          fragment fragmentBar on Bar {\n            i\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 10,
                    j: 8,
                    k: 9,
                },
            });
            proxy.writeFragment({
                data: { j: 11, k: 12, __typename: 'Bar' },
                id: 'bar',
                fragment: (_d = ["\n          fragment fragmentBar on Bar {\n            j\n            k\n          }\n        "], _d.raw = ["\n          fragment fragmentBar on Bar {\n            j\n            k\n          }\n        "], gql(_d)),
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 10,
                    j: 11,
                    k: 12,
                },
            });
            proxy.writeFragment({
                data: {
                    __typename: 'Foo',
                    e: 4,
                    f: 5,
                    g: 6,
                    h: { __typename: 'Bar', id: 'bar', i: 7, j: 8, k: 9 },
                },
                id: 'foo',
                fragment: (_e = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], _e.raw = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], gql(_e)),
                fragmentName: 'fooFragment',
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 7,
                    j: 8,
                    k: 9,
                },
            });
            proxy.writeFragment({
                data: { __typename: 'Bar', i: 10, j: 11, k: 12 },
                id: 'bar',
                fragment: (_f = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], _f.raw = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], gql(_f)),
                fragmentName: 'barFragment',
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                foo: {
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    i: 10,
                    j: 11,
                    k: 12,
                },
            });
            var _a, _b, _c, _d, _e, _f;
        });
        it('will write some data to the store with variables', function () {
            var proxy = createDataProxy();
            proxy.writeFragment({
                data: {
                    a: 1,
                    b: 2,
                },
                id: 'foo',
                fragment: (_a = ["\n          fragment foo on Foo {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], _a.raw = ["\n          fragment foo on Foo {\n            a: field(literal: true, value: 42)\n            b: field(literal: $literal, value: $value)\n          }\n        "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            });
            assert.deepEqual(proxy.store.getState().apollo.data, {
                foo: {
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            });
            var _a;
        });
    });
});
describe('TransactionDataProxy', function () {
    describe('readQuery', function () {
        it('will throw an error if the transaction has finished', function () {
            var proxy = new TransactionDataProxy({}, {});
            proxy.finish();
            assert.throws(function () {
                proxy.readQuery({});
            }, 'Cannot call transaction methods after the transaction has finished.');
        });
        it('will read some data from the store', function () {
            var proxy = new TransactionDataProxy({
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                },
            }, {});
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            {\n              a\n            }\n          "], _a.raw = ["\n            {\n              a\n            }\n          "], gql(_a)),
            }), { a: 1 });
            assert.deepEqual(proxy.readQuery({
                query: (_b = ["\n            {\n              b\n              c\n            }\n          "], _b.raw = ["\n            {\n              b\n              c\n            }\n          "], gql(_b)),
            }), { b: 2, c: 3 });
            assert.deepEqual(proxy.readQuery({
                query: (_c = ["\n            {\n              a\n              b\n              c\n            }\n          "], _c.raw = ["\n            {\n              a\n              b\n              c\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
        it('will read some deeply nested data from the store', function () {
            var proxy = new TransactionDataProxy({
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: {
                        type: 'id',
                        id: 'foo',
                        generated: false,
                    },
                },
                foo: {
                    __typename: 'Foo',
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    __typename: 'Bar',
                    i: 7,
                    j: 8,
                    k: 9,
                },
            }, { addTypename: true });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], _a.raw = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], gql(_a)),
            }), { a: 1, d: { __typename: 'Foo', e: 4 } });
            assert.deepEqual(proxy.readQuery({
                query: (_b = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], _b.raw = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], gql(_b)),
            }), {
                a: 1,
                d: { __typename: 'Foo', e: 4, h: { __typename: 'Bar', i: 7 } },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_c = ["\n            {\n              a\n              b\n              c\n              d {\n                e\n                f\n                g\n                h {\n                  i\n                  j\n                  k\n                }\n              }\n            }\n          "], _c.raw = ["\n            {\n              a\n              b\n              c\n              d {\n                e\n                f\n                g\n                h {\n                  i\n                  j\n                  k\n                }\n              }\n            }\n          "], gql(_c)),
            }), {
                a: 1,
                b: 2,
                c: 3,
                d: {
                    __typename: 'Foo',
                    e: 4,
                    f: 5,
                    g: 6,
                    h: { __typename: 'Bar', i: 7, j: 8, k: 9 },
                },
            });
            var _a, _b, _c;
        });
        it('will read some data from the store with variables', function () {
            var proxy = new TransactionDataProxy({
                ROOT_QUERY: {
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            }, { addTypename: true });
            assert.deepEqual(proxy.readQuery({
                query: (_a = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { a: 1, b: 2 });
            var _a;
        });
        it('will read data using custom resolvers', function () {
            var proxy = new TransactionDataProxy({
                ROOT_QUERY: {
                    __typename: 'Query',
                },
                foo: {
                    __typename: 'Foo',
                    id: 'foo',
                    a: 1,
                    b: '2',
                    c: null,
                },
            }, {
                dataIdFromObject: function (object) { return object.id; },
                customResolvers: {
                    Query: {
                        thing: function (_, args) { return toIdValue(args.id); },
                    },
                },
                addTypename: true,
            });
            var queryResult = proxy.readQuery({
                query: (_a = ["\n          query {\n            thing(id: \"foo\") {\n              a\n              b\n              c\n            }\n          }\n        "], _a.raw = ["\n          query {\n            thing(id: \"foo\") {\n              a\n              b\n              c\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(queryResult, {
                thing: { __typename: 'Foo', a: 1, b: '2', c: null },
            });
            var _a;
        });
    });
    describe('readFragment', function () {
        it('will throw an error if the transaction has finished', function () {
            var proxy = new TransactionDataProxy({}, {});
            proxy.finish();
            assert.throws(function () {
                proxy.readFragment({});
            }, 'Cannot call transaction methods after the transaction has finished.');
        });
        it('will throw an error when there is no fragment', function () {
            var proxy = new TransactionDataProxy({}, {});
            assert.throws(function () {
                proxy.readFragment({ id: 'x' });
            }, 'fragment option is required. Please pass a GraphQL fragment to readFragment.');
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            query {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            query {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            schema {\n              query: Query\n            }\n          "], _a.raw = ["\n            schema {\n              query: Query\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will throw an error when there is more than one fragment but no fragment name', function () {
            var proxy = new TransactionDataProxy({}, {});
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                proxy.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will read some deeply nested data from the store at any id', function () {
            var proxy = new TransactionDataProxy({
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: {
                        type: 'id',
                        id: 'foo',
                        generated: false,
                    },
                },
                foo: {
                    __typename: 'Foo',
                    e: 4,
                    f: 5,
                    g: 6,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    __typename: 'Bar',
                    i: 7,
                    j: 8,
                    k: 9,
                },
            }, { addTypename: true });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], _a.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], gql(_a)),
            }), { __typename: 'Foo', e: 4, h: { __typename: 'Bar', i: 7 } });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_b = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], _b.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], gql(_b)),
            }), {
                __typename: 'Foo',
                e: 4,
                f: 5,
                g: 6,
                h: { __typename: 'Bar', i: 7, j: 8, k: 9 },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_c = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], _c.raw = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], gql(_c)),
            }), { __typename: 'Bar', i: 7 });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_d = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _d.raw = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_d)),
            }), { __typename: 'Bar', i: 7, j: 8, k: 9 });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_e = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _e.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_e)),
                fragmentName: 'fragmentFoo',
            }), {
                __typename: 'Foo',
                e: 4,
                f: 5,
                g: 6,
                h: { __typename: 'Bar', i: 7, j: 8, k: 9 },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'bar',
                fragment: (_f = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _f.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_f)),
                fragmentName: 'fragmentBar',
            }), { __typename: 'Bar', i: 7, j: 8, k: 9 });
            var _a, _b, _c, _d, _e, _f;
        });
        it('will read some data from the store with variables', function () {
            var proxy = new TransactionDataProxy({
                foo: {
                    __typename: 'Foo',
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            }, { addTypename: true });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { a: 1, b: 2, __typename: 'Foo' });
            var _a;
        });
        it('will return null when an id that can’t be found is provided', function () {
            var client1 = new TransactionDataProxy({}, {});
            var client2 = new TransactionDataProxy({
                bar: { __typename: 'Type1', a: 1, b: 2, c: 3 },
            }, {});
            var client3 = new TransactionDataProxy({
                foo: { __typename: 'Type1', a: 1, b: 2, c: 3 },
            }, {});
            assert.equal(client1.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
            }), null);
            assert.equal(client2.readFragment({
                id: 'foo',
                fragment: (_b = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _b.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_b)),
            }), null);
            assert.deepEqual(client3.readFragment({
                id: 'foo',
                fragment: (_c = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], _c.raw = ["\n            fragment fooFragment on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
        it('will read data using custom resolvers', function () {
            var proxy = new TransactionDataProxy({
                ROOT_QUERY: {
                    __typename: 'Query',
                },
                foo: {
                    __typename: 'Query',
                    id: 'foo',
                },
                bar: {
                    __typename: 'Thing',
                    id: 'bar',
                    a: 1,
                    b: '2',
                    c: null,
                },
            }, {
                dataIdFromObject: function (object) { return object.id; },
                customResolvers: {
                    Query: {
                        thing: function (_, args) { return toIdValue(args.id); },
                    },
                },
                addTypename: true,
            });
            var queryResult = proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n          fragment fooFragment on Query {\n            thing(id: \"bar\") {\n              a\n              b\n              c\n            }\n          }\n        "], _a.raw = ["\n          fragment fooFragment on Query {\n            thing(id: \"bar\") {\n              a\n              b\n              c\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(queryResult, {
                __typename: 'Query',
                thing: { __typename: 'Thing', a: 1, b: '2', c: null },
            });
            var _a;
        });
    });
    describe('writeQuery', function () {
        it('will throw an error if the transaction has finished', function () {
            var proxy = new TransactionDataProxy({}, {});
            proxy.finish();
            assert.throws(function () {
                proxy.writeQuery({});
            }, 'Cannot call transaction methods after the transaction has finished.');
        });
        it('will create writes that get returned when finished', function () {
            var proxy = new TransactionDataProxy({}, { addTypename: true });
            proxy.writeQuery({
                data: { a: 1, b: 2, c: 3 },
                query: (_a = ["\n          {\n            a\n            b\n            c\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            c\n          }\n        "], gql(_a)),
            });
            proxy.writeQuery({
                data: { foo: { d: 4, e: 5, bar: { f: 6, g: 7 } } },
                query: (_b = ["\n          {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], gql(_b)),
                variables: { id: 7 },
            });
            var writes = proxy.finish();
            var document1 = addTypenameToDocument((_c = ["\n          {\n            a\n            b\n            c\n          }\n        "], _c.raw = ["\n          {\n            a\n            b\n            c\n          }\n        "], gql(_c)));
            var document2 = addTypenameToDocument((_d = ["\n          {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], _d.raw = ["\n          {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], gql(_d)));
            assert.deepEqual(writes, [
                {
                    rootId: 'ROOT_QUERY',
                    result: { a: 1, b: 2, c: 3 },
                    document: document1,
                    operationName: getOperationName(document1),
                    variables: {},
                },
                {
                    rootId: 'ROOT_QUERY',
                    result: { foo: { d: 4, e: 5, bar: { f: 6, g: 7 } } },
                    document: document2,
                    operationName: getOperationName(document2),
                    variables: { id: 7 },
                },
            ]);
            var _a, _b, _c, _d;
        });
    });
    describe('writeFragment', function () {
        it('will throw an error if the transaction has finished', function () {
            var proxy = new TransactionDataProxy({}, { addTypename: true });
            proxy.finish();
            assert.throws(function () {
                proxy.writeFragment({});
            }, 'Cannot call transaction methods after the transaction has finished.');
        });
        it('will create writes that get returned when finished', function () {
            var proxy = new TransactionDataProxy({}, {});
            proxy.writeFragment({
                data: { a: 1, b: 2, c: 3 },
                id: 'foo',
                fragment: (_a = ["\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n        "], _a.raw = ["\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n        "], gql(_a)),
            });
            proxy.writeFragment({
                data: { foo: { d: 4, e: 5, bar: { f: 6, g: 7 } } },
                id: 'bar',
                fragment: (_b = ["\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n\n          fragment fragment2 on Bar {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], _b.raw = ["\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n\n          fragment fragment2 on Bar {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], gql(_b)),
                fragmentName: 'fragment2',
                variables: { id: 7 },
            });
            var writes = proxy.finish();
            assert.equal(writes.length, 2);
            assert.deepEqual(Object.keys(writes[0]), [
                'rootId',
                'result',
                'document',
                'operationName',
                'variables',
            ]);
            assert.equal(writes[0].rootId, 'foo');
            assert.deepEqual(writes[0].result, { a: 1, b: 2, c: 3 });
            assert.deepEqual(writes[0].variables, {});
            assert.equal(print(writes[0].document), print((_c = ["\n          {\n            ...fragment1\n          }\n\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n        "], _c.raw = ["\n          {\n            ...fragment1\n          }\n\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n        "], gql(_c))));
            assert.deepEqual(Object.keys(writes[1]), [
                'rootId',
                'result',
                'document',
                'operationName',
                'variables',
            ]);
            assert.equal(writes[1].rootId, 'bar');
            assert.deepEqual(writes[1].result, {
                foo: { d: 4, e: 5, bar: { f: 6, g: 7 } },
            });
            assert.deepEqual(writes[1].variables, { id: 7 });
            assert.equal(print(writes[1].document), print((_d = ["\n          {\n            ...fragment2\n          }\n\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n\n          fragment fragment2 on Bar {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], _d.raw = ["\n          {\n            ...fragment2\n          }\n\n          fragment fragment1 on Foo {\n            a\n            b\n            c\n          }\n\n          fragment fragment2 on Bar {\n            foo(id: $id) {\n              d\n              e\n              bar {\n                f\n                g\n              }\n            }\n          }\n        "], gql(_d))));
            var _a, _b, _c, _d;
        });
    });
    describe('write then read', function () {
        it('will write data locally which will then be read back', function () {
            var data = {
                foo: {
                    __typename: 'Foo',
                    a: 1,
                    b: 2,
                    c: 3,
                    bar: {
                        type: 'id',
                        id: '$foo.bar',
                        generated: true,
                    },
                },
                '$foo.bar': {
                    __typename: 'Bar',
                    d: 4,
                    e: 5,
                    f: 6,
                },
            };
            var proxy = new TransactionDataProxy(data, { addTypename: true });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _a.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_a)),
            }), {
                __typename: 'Foo',
                a: 1,
                b: 2,
                c: 3,
                bar: { __typename: 'Bar', d: 4, e: 5, f: 6 },
            });
            proxy.writeFragment({
                id: 'foo',
                fragment: (_b = ["\n          fragment x on Foo {\n            a\n          }\n        "], _b.raw = ["\n          fragment x on Foo {\n            a\n          }\n        "], gql(_b)),
                data: { a: 7 },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_c = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _c.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_c)),
            }), {
                __typename: 'Foo',
                a: 7,
                b: 2,
                c: 3,
                bar: { __typename: 'Bar', d: 4, e: 5, f: 6 },
            });
            proxy.writeFragment({
                id: 'foo',
                fragment: (_d = ["\n          fragment x on Foo {\n            bar {\n              d\n            }\n          }\n        "], _d.raw = ["\n          fragment x on Foo {\n            bar {\n              d\n            }\n          }\n        "], gql(_d)),
                data: { __typename: 'Foo', bar: { __typename: 'Bar', d: 8 } },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_e = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _e.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_e)),
            }), {
                __typename: 'Foo',
                a: 7,
                b: 2,
                c: 3,
                bar: { __typename: 'Bar', d: 8, e: 5, f: 6 },
            });
            proxy.writeFragment({
                id: '$foo.bar',
                fragment: (_f = ["\n          fragment y on Bar {\n            e\n          }\n        "], _f.raw = ["\n          fragment y on Bar {\n            e\n          }\n        "], gql(_f)),
                data: { __typename: 'Bar', e: 9 },
            });
            assert.deepEqual(proxy.readFragment({
                id: 'foo',
                fragment: (_g = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _g.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_g)),
            }), {
                __typename: 'Foo',
                a: 7,
                b: 2,
                c: 3,
                bar: { __typename: 'Bar', d: 8, e: 9, f: 6 },
            });
            assert.deepEqual(proxy.data, {
                foo: {
                    __typename: 'Foo',
                    a: 7,
                    b: 2,
                    c: 3,
                    bar: {
                        type: 'id',
                        id: '$foo.bar',
                        generated: true,
                    },
                },
                '$foo.bar': {
                    __typename: 'Bar',
                    d: 8,
                    e: 9,
                    f: 6,
                },
            });
            assert.deepEqual(data, {
                foo: {
                    __typename: 'Foo',
                    a: 1,
                    b: 2,
                    c: 3,
                    bar: {
                        type: 'id',
                        id: '$foo.bar',
                        generated: true,
                    },
                },
                '$foo.bar': {
                    __typename: 'Bar',
                    d: 4,
                    e: 5,
                    f: 6,
                },
            });
            var _a, _b, _c, _d, _e, _f, _g;
        });
        it('will write data to a specific id', function () {
            var data = {};
            var proxy = new TransactionDataProxy(data, {
                dataIdFromObject: function (o) { return o.id; },
                addTypename: true,
            });
            proxy.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: {
                        __typename: 'Foo',
                        c: 3,
                        d: 4,
                        bar: { __typename: 'Bar', id: 'foobar', e: 5, f: 6 },
                    },
                },
            });
            assert.deepEqual(proxy.readQuery({
                query: (_b = ["\n            {\n              a\n              b\n              foo {\n                c\n                d\n                bar {\n                  id\n                  e\n                  f\n                }\n              }\n            }\n          "], _b.raw = ["\n            {\n              a\n              b\n              foo {\n                c\n                d\n                bar {\n                  id\n                  e\n                  f\n                }\n              }\n            }\n          "], gql(_b)),
            }), {
                a: 1,
                b: 2,
                foo: {
                    __typename: 'Foo',
                    c: 3,
                    d: 4,
                    bar: { __typename: 'Bar', id: 'foobar', e: 5, f: 6 },
                },
            });
            assert.deepEqual(proxy.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo': {
                    __typename: 'Foo',
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: 'foobar',
                        generated: false,
                    },
                },
                foobar: {
                    __typename: 'Bar',
                    id: 'foobar',
                    e: 5,
                    f: 6,
                },
            });
            assert.deepEqual(data, {});
            var _a, _b;
        });
    });
});
//# sourceMappingURL=proxy.js.map