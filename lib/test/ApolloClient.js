import { assert } from 'chai';
import gql from 'graphql-tag';
import ApolloClient from '../src/ApolloClient';
import { withWarning } from './util/wrap';
describe('ApolloClient', function () {
    describe('readQuery', function () {
        it('will read some data from the store', function () {
            var client = new ApolloClient({
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
            assert.deepEqual(client.readQuery({
                query: (_a = ["\n            {\n              a\n            }\n          "], _a.raw = ["\n            {\n              a\n            }\n          "], gql(_a)),
            }), { a: 1 });
            assert.deepEqual(client.readQuery({
                query: (_b = ["\n            {\n              b\n              c\n            }\n          "], _b.raw = ["\n            {\n              b\n              c\n            }\n          "], gql(_b)),
            }), { b: 2, c: 3 });
            assert.deepEqual(client.readQuery({
                query: (_c = ["\n            {\n              a\n              b\n              c\n            }\n          "], _c.raw = ["\n            {\n              a\n              b\n              c\n            }\n          "], gql(_c)),
            }), { a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
        it('will read some deeply nested data from the store', function () {
            var client = new ApolloClient({
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
            assert.deepEqual(client.readQuery({
                query: (_a = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], _a.raw = ["\n            {\n              a\n              d {\n                e\n              }\n            }\n          "], gql(_a)),
            }), { a: 1, d: { e: 4, __typename: 'Foo' } });
            assert.deepEqual(client.readQuery({
                query: (_b = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], _b.raw = ["\n            {\n              a\n              d {\n                e\n                h {\n                  i\n                }\n              }\n            }\n          "], gql(_b)),
            }), {
                a: 1,
                d: { __typename: 'Foo', e: 4, h: { i: 7, __typename: 'Bar' } },
            });
            assert.deepEqual(client.readQuery({
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
            var client = new ApolloClient({
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
            assert.deepEqual(client.readQuery({
                query: (_a = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            query($literal: Boolean, $value: Int) {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { a: 1, b: 2 });
            var _a;
        });
    });
    it('will read some data from the store with default values', function () {
        var client = new ApolloClient({
            initialState: {
                apollo: {
                    data: {
                        ROOT_QUERY: {
                            'field({"literal":true,"value":-1})': 1,
                            'field({"literal":false,"value":42})': 2,
                        },
                    },
                },
            },
        });
        assert.deepEqual(client.readQuery({
            query: (_a = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], _a.raw = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], gql(_a)),
            variables: {
                literal: false,
                value: 42,
            },
        }), { a: 2 });
        assert.deepEqual(client.readQuery({
            query: (_b = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], _b.raw = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], gql(_b)),
            variables: {
                literal: true,
            },
        }), { a: 1 });
        var _a, _b;
    });
    describe('readFragment', function () {
        it('will throw an error when there is no fragment', function () {
            var client = new ApolloClient();
            assert.throws(function () {
                client.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            query {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            query {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                client.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            schema {\n              query: Query\n            }\n          "], _a.raw = ["\n            schema {\n              query: Query\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will throw an error when there is more than one fragment but no fragment name', function () {
            var client = new ApolloClient();
            assert.throws(function () {
                client.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                client.readFragment({
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will read some deeply nested data from the store at any id', function () {
            var client = new ApolloClient({
                initialState: {
                    apollo: {
                        data: {
                            ROOT_QUERY: {
                                __typename: 'Foo',
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
            assert.deepEqual(client.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], _a.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              h {\n                i\n              }\n            }\n          "], gql(_a)),
            }), { __typename: 'Foo', e: 4, h: { __typename: 'Bar', i: 7 } });
            assert.deepEqual(client.readFragment({
                id: 'foo',
                fragment: (_b = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], _b.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          "], gql(_b)),
            }), {
                __typename: 'Foo',
                e: 4,
                f: 5,
                g: 6,
                h: { __typename: 'Bar', i: 7, j: 8, k: 9 },
            });
            assert.deepEqual(client.readFragment({
                id: 'bar',
                fragment: (_c = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], _c.raw = ["\n            fragment fragmentBar on Bar {\n              i\n            }\n          "], gql(_c)),
            }), { __typename: 'Bar', i: 7 });
            assert.deepEqual(client.readFragment({
                id: 'bar',
                fragment: (_d = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _d.raw = ["\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_d)),
            }), { __typename: 'Bar', i: 7, j: 8, k: 9 });
            assert.deepEqual(client.readFragment({
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
            assert.deepEqual(client.readFragment({
                id: 'bar',
                fragment: (_f = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], _f.raw = ["\n            fragment fragmentFoo on Foo {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n\n            fragment fragmentBar on Bar {\n              i\n              j\n              k\n            }\n          "], gql(_f)),
                fragmentName: 'fragmentBar',
            }), { __typename: 'Bar', i: 7, j: 8, k: 9 });
            var _a, _b, _c, _d, _e, _f;
        });
        it('will read some data from the store with variables', function () {
            var client = new ApolloClient({
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
            assert.deepEqual(client.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], _a.raw = ["\n            fragment foo on Foo {\n              a: field(literal: true, value: 42)\n              b: field(literal: $literal, value: $value)\n            }\n          "], gql(_a)),
                variables: {
                    literal: false,
                    value: 42,
                },
            }), { __typename: 'Foo', a: 1, b: 2 });
            var _a;
        });
        it('will return null when an id that can’t be found is provided', function () {
            var client1 = new ApolloClient();
            var client2 = new ApolloClient({
                initialState: {
                    apollo: {
                        data: {
                            bar: { __typename: 'Foo', a: 1, b: 2, c: 3 },
                        },
                    },
                },
            });
            var client3 = new ApolloClient({
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
            }), { __typename: 'Foo', a: 1, b: 2, c: 3 });
            var _a, _b, _c;
        });
    });
    describe('writeQuery', function () {
        it('will write some data to the store', function () {
            var client = new ApolloClient();
            client.writeQuery({
                data: { a: 1 },
                query: (_a = ["\n          {\n            a\n          }\n        "], _a.raw = ["\n          {\n            a\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                },
            });
            client.writeQuery({
                data: { b: 2, c: 3 },
                query: (_b = ["\n          {\n            b\n            c\n          }\n        "], _b.raw = ["\n          {\n            b\n            c\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    c: 3,
                },
            });
            client.writeQuery({
                data: { a: 4, b: 5, c: 6 },
                query: (_c = ["\n          {\n            a\n            b\n            c\n          }\n        "], _c.raw = ["\n          {\n            a\n            b\n            c\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 4,
                    b: 5,
                    c: 6,
                },
            });
            var _a, _b, _c;
        });
        it('will write some deeply nested data to the store', function () {
            var client = new ApolloClient();
            client.writeQuery({
                data: { a: 1, d: { __typename: 'D', e: 4 } },
                query: (_a = ["\n          {\n            a\n            d {\n              e\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            d {\n              e\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    __typename: 'D',
                    e: 4,
                },
            });
            client.writeQuery({
                data: { a: 1, d: { __typename: 'D', h: { __typename: 'H', i: 7 } } },
                query: (_b = ["\n          {\n            a\n            d {\n              h {\n                i\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            a\n            d {\n              h {\n                i\n              }\n            }\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    d: {
                        type: 'id',
                        id: '$ROOT_QUERY.d',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d': {
                    __typename: 'D',
                    e: 4,
                    h: {
                        type: 'id',
                        id: '$ROOT_QUERY.d.h',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.d.h': {
                    __typename: 'H',
                    i: 7,
                },
            });
            client.writeQuery({
                data: {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: {
                        __typename: 'D',
                        e: 4,
                        f: 5,
                        g: 6,
                        h: {
                            __typename: 'H',
                            i: 7,
                            j: 8,
                            k: 9,
                        },
                    },
                },
                query: (_c = ["\n          {\n            a\n            b\n            c\n            d {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          }\n        "], _c.raw = ["\n          {\n            a\n            b\n            c\n            d {\n              e\n              f\n              g\n              h {\n                i\n                j\n                k\n              }\n            }\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    __typename: 'D',
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
                    __typename: 'H',
                    i: 7,
                    j: 8,
                    k: 9,
                },
            });
            var _a, _b, _c;
        });
        it('will write some data to the store with variables', function () {
            var client = new ApolloClient();
            client.writeQuery({
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
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            });
            var _a;
        });
        it('will write some data to the store with default values for variables', function () {
            var client = new ApolloClient();
            client.writeQuery({
                data: {
                    a: 2,
                },
                query: (_a = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], _a.raw = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], gql(_a)),
                variables: {
                    literal: true,
                    value: 42,
                },
            });
            client.writeQuery({
                data: {
                    a: 1,
                },
                query: (_b = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], _b.raw = ["\n          query($literal: Boolean, $value: Int = -1) {\n            a: field(literal: $literal, value: $value)\n          }\n        "], gql(_b)),
                variables: {
                    literal: false,
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    'field({"literal":true,"value":42})': 2,
                    'field({"literal":false,"value":-1})': 1,
                },
            });
            var _a, _b;
        });
        it('should warn when the data provided does not match the query shape', function () {
            var client = new ApolloClient();
            return withWarning(function () {
                client.writeQuery({
                    data: {
                        todos: [
                            {
                                id: '1',
                                name: 'Todo 1',
                                __typename: 'Todo',
                            },
                        ],
                    },
                    query: (_a = ["\n            query {\n              todos {\n                id\n                name\n                description\n              }\n            }\n          "], _a.raw = ["\n            query {\n              todos {\n                id\n                name\n                description\n              }\n            }\n          "], gql(_a)),
                });
                var _a;
            }, /Missing field description/);
        });
    });
    describe('writeFragment', function () {
        it('will throw an error when there is no fragment', function () {
            var client = new ApolloClient();
            assert.throws(function () {
                client.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            query {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            query {\n              a\n              b\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                client.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            schema {\n              query: Query\n            }\n          "], _a.raw = ["\n            schema {\n              query: Query\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will throw an error when there is more than one fragment but no fragment name', function () {
            var client = new ApolloClient();
            assert.throws(function () {
                client.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                client.writeFragment({
                    data: {},
                    id: 'x',
                    fragment: (_a = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], _a.raw = ["\n            fragment a on A {\n              a\n            }\n\n            fragment b on B {\n              b\n            }\n\n            fragment c on C {\n              c\n            }\n          "], gql(_a)),
                });
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will write some deeply nested data into the store at any id', function () {
            var client = new ApolloClient({
                dataIdFromObject: function (o) { return o.id; },
            });
            client.writeFragment({
                data: {
                    __typename: 'Foo',
                    e: 4,
                    h: { __typename: 'Bar', id: 'bar', i: 7 },
                },
                id: 'foo',
                fragment: (_a = ["\n          fragment fragmentFoo on Foo {\n            e\n            h {\n              i\n            }\n          }\n        "], _a.raw = ["\n          fragment fragmentFoo on Foo {\n            e\n            h {\n              i\n            }\n          }\n        "], gql(_a)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                foo: {
                    __typename: 'Foo',
                    e: 4,
                    h: {
                        type: 'id',
                        id: 'bar',
                        generated: false,
                    },
                },
                bar: {
                    __typename: 'Bar',
                    i: 7,
                },
            });
            client.writeFragment({
                data: {
                    __typename: 'Foo',
                    f: 5,
                    g: 6,
                    h: { __typename: 'Bar', id: 'bar', j: 8, k: 9 },
                },
                id: 'foo',
                fragment: (_b = ["\n          fragment fragmentFoo on Foo {\n            f\n            g\n            h {\n              j\n              k\n            }\n          }\n        "], _b.raw = ["\n          fragment fragmentFoo on Foo {\n            f\n            g\n            h {\n              j\n              k\n            }\n          }\n        "], gql(_b)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
            });
            client.writeFragment({
                data: { __typename: 'Bar', i: 10 },
                id: 'bar',
                fragment: (_c = ["\n          fragment fragmentBar on Bar {\n            i\n          }\n        "], _c.raw = ["\n          fragment fragmentBar on Bar {\n            i\n          }\n        "], gql(_c)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    i: 10,
                    j: 8,
                    k: 9,
                },
            });
            client.writeFragment({
                data: { __typename: 'Bar', j: 11, k: 12 },
                id: 'bar',
                fragment: (_d = ["\n          fragment fragmentBar on Bar {\n            j\n            k\n          }\n        "], _d.raw = ["\n          fragment fragmentBar on Bar {\n            j\n            k\n          }\n        "], gql(_d)),
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    i: 10,
                    j: 11,
                    k: 12,
                },
            });
            client.writeFragment({
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
            assert.deepEqual(client.store.getState().apollo.data, {
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
            });
            client.writeFragment({
                data: { __typename: 'Bar', i: 10, j: 11, k: 12 },
                id: 'bar',
                fragment: (_f = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], _f.raw = ["\n          fragment fooFragment on Foo {\n            e\n            f\n            g\n            h {\n              i\n              j\n              k\n            }\n          }\n\n          fragment barFragment on Bar {\n            i\n            j\n            k\n          }\n        "], gql(_f)),
                fragmentName: 'barFragment',
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    i: 10,
                    j: 11,
                    k: 12,
                },
            });
            var _a, _b, _c, _d, _e, _f;
        });
        it('will write some data to the store with variables', function () {
            var client = new ApolloClient();
            client.writeFragment({
                data: {
                    __typename: 'Foo',
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
            assert.deepEqual(client.store.getState().apollo.data, {
                foo: {
                    __typename: 'Foo',
                    'field({"literal":true,"value":42})': 1,
                    'field({"literal":false,"value":42})': 2,
                },
            });
            var _a;
        });
        it('should warn when the data provided does not match the fragment shape', function () {
            var client = new ApolloClient();
            return withWarning(function () {
                client.writeFragment({
                    data: { __typename: 'Bar', i: 10 },
                    id: 'bar',
                    fragment: (_a = ["\n            fragment fragmentBar on Bar {\n              i\n              e\n            }\n          "], _a.raw = ["\n            fragment fragmentBar on Bar {\n              i\n              e\n            }\n          "], gql(_a)),
                });
                var _a;
            }, /Missing field e/);
        });
    });
    describe('write then read', function () {
        it('will write data locally which will then be read back', function () {
            var client = new ApolloClient({
                initialState: {
                    apollo: {
                        data: {
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
                        },
                    },
                },
            });
            assert.deepEqual(client.readFragment({
                id: 'foo',
                fragment: (_a = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _a.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_a)),
            }), {
                __typename: 'Foo',
                a: 1,
                b: 2,
                c: 3,
                bar: { d: 4, e: 5, f: 6, __typename: 'Bar' },
            });
            client.writeFragment({
                id: 'foo',
                fragment: (_b = ["\n          fragment x on Foo {\n            a\n          }\n        "], _b.raw = ["\n          fragment x on Foo {\n            a\n          }\n        "], gql(_b)),
                data: { __typename: 'Foo', a: 7 },
            });
            assert.deepEqual(client.readFragment({
                id: 'foo',
                fragment: (_c = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _c.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_c)),
            }), {
                __typename: 'Foo',
                a: 7,
                b: 2,
                c: 3,
                bar: { __typename: 'Bar', d: 4, e: 5, f: 6 },
            });
            client.writeFragment({
                id: 'foo',
                fragment: (_d = ["\n          fragment x on Foo {\n            bar {\n              d\n            }\n          }\n        "], _d.raw = ["\n          fragment x on Foo {\n            bar {\n              d\n            }\n          }\n        "], gql(_d)),
                data: { __typename: 'Foo', bar: { __typename: 'Bar', d: 8 } },
            });
            assert.deepEqual(client.readFragment({
                id: 'foo',
                fragment: (_e = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _e.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_e)),
            }), {
                __typename: 'Foo',
                a: 7,
                b: 2,
                c: 3,
                bar: { __typename: 'Bar', d: 8, e: 5, f: 6 },
            });
            client.writeFragment({
                id: '$foo.bar',
                fragment: (_f = ["\n          fragment y on Bar {\n            e\n          }\n        "], _f.raw = ["\n          fragment y on Bar {\n            e\n          }\n        "], gql(_f)),
                data: { __typename: 'Bar', e: 9 },
            });
            assert.deepEqual(client.readFragment({
                id: 'foo',
                fragment: (_g = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], _g.raw = ["\n            fragment x on Foo {\n              a\n              b\n              c\n              bar {\n                d\n                e\n                f\n              }\n            }\n          "], gql(_g)),
            }), {
                __typename: 'Foo',
                a: 7,
                b: 2,
                c: 3,
                bar: { __typename: 'Bar', d: 8, e: 9, f: 6 },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
            var _a, _b, _c, _d, _e, _f, _g;
        });
        it('will write data to a specific id', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
                dataIdFromObject: function (o) { return o.key; },
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                key\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                key\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: {
                        __typename: 'foo',
                        c: 3,
                        d: 4,
                        bar: { key: 'foobar', __typename: 'bar', e: 5, f: 6 },
                    },
                },
            });
            assert.deepEqual(client.readQuery({
                query: (_b = ["\n            {\n              a\n              b\n              foo {\n                c\n                d\n                bar {\n                  key\n                  e\n                  f\n                }\n              }\n            }\n          "], _b.raw = ["\n            {\n              a\n              b\n              foo {\n                c\n                d\n                bar {\n                  key\n                  e\n                  f\n                }\n              }\n            }\n          "], gql(_b)),
            }), {
                a: 1,
                b: 2,
                foo: {
                    __typename: 'foo',
                    c: 3,
                    d: 4,
                    bar: { __typename: 'bar', key: 'foobar', e: 5, f: 6 },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    __typename: 'foo',
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: 'foobar',
                        generated: false,
                    },
                },
                foobar: {
                    key: 'foobar',
                    __typename: 'bar',
                    e: 5,
                    f: 6,
                },
            });
            var _a, _b;
        });
        it('will not use a default id getter if __typename is not present', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
                addTypename: false,
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: { c: 3, d: 4, bar: { id: 'foobar', e: 5, f: 6 } },
                },
            });
            client.writeQuery({
                query: (_b = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                _id\n                k\n                l\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                _id\n                k\n                l\n              }\n            }\n          }\n        "], gql(_b)),
                data: {
                    g: 8,
                    h: 9,
                    bar: { i: 10, j: 11, foo: { _id: 'barfoo', k: 12, l: 13 } },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    g: 8,
                    h: 9,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.bar',
                        generated: true,
                    },
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo': {
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo.bar',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.bar': {
                    i: 10,
                    j: 11,
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.bar.foo',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo.bar': {
                    id: 'foobar',
                    e: 5,
                    f: 6,
                },
                '$ROOT_QUERY.bar.foo': {
                    _id: 'barfoo',
                    k: 12,
                    l: 13,
                },
            });
            var _a, _b;
        });
        it('will not use a default id getter if id and _id are not present', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: {
                        __typename: 'foo',
                        c: 3,
                        d: 4,
                        bar: { __typename: 'bar', e: 5, f: 6 },
                    },
                },
            });
            client.writeQuery({
                query: (_b = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                k\n                l\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                k\n                l\n              }\n            }\n          }\n        "], gql(_b)),
                data: {
                    g: 8,
                    h: 9,
                    bar: {
                        __typename: 'bar',
                        i: 10,
                        j: 11,
                        foo: { __typename: 'foo', k: 12, l: 13 },
                    },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    g: 8,
                    h: 9,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.bar',
                        generated: true,
                    },
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo': {
                    __typename: 'foo',
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo.bar',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.bar': {
                    __typename: 'bar',
                    i: 10,
                    j: 11,
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.bar.foo',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo.bar': {
                    __typename: 'bar',
                    e: 5,
                    f: 6,
                },
                '$ROOT_QUERY.bar.foo': {
                    __typename: 'foo',
                    k: 12,
                    l: 13,
                },
            });
            var _a, _b;
        });
        it('will use a default id getter if __typename and id are present', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: {
                        __typename: 'foo',
                        c: 3,
                        d: 4,
                        bar: { __typename: 'bar', id: 'foobar', e: 5, f: 6 },
                    },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    __typename: 'foo',
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: 'bar:foobar',
                        generated: false,
                    },
                },
                'bar:foobar': {
                    id: 'foobar',
                    __typename: 'bar',
                    e: 5,
                    f: 6,
                },
            });
            var _a;
        });
        it('will use a default id getter if __typename and _id are present', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                _id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                _id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: {
                        __typename: 'foo',
                        c: 3,
                        d: 4,
                        bar: { __typename: 'bar', _id: 'foobar', e: 5, f: 6 },
                    },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    __typename: 'foo',
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: 'bar:foobar',
                        generated: false,
                    },
                },
                'bar:foobar': {
                    __typename: 'bar',
                    _id: 'foobar',
                    e: 5,
                    f: 6,
                },
            });
            var _a;
        });
        it('will not use a default id getter if id is present and __typename is not present', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
                addTypename: false,
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: { c: 3, d: 4, bar: { id: 'foobar', e: 5, f: 6 } },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo.bar',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo.bar': {
                    id: 'foobar',
                    e: 5,
                    f: 6,
                },
            });
            var _a;
        });
        it('will not use a default id getter if _id is present but __typename is not present', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
                addTypename: false,
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                _id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                _id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: { c: 3, d: 4, bar: { _id: 'foobar', e: 5, f: 6 } },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
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
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo.bar',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo.bar': {
                    _id: 'foobar',
                    e: 5,
                    f: 6,
                },
            });
            var _a;
        });
        it('will not use a default id getter if either _id or id is present when __typename is not also present', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
                addTypename: false,
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: {
                        c: 3,
                        d: 4,
                        bar: { __typename: 'bar', id: 'foobar', e: 5, f: 6 },
                    },
                },
            });
            client.writeQuery({
                query: (_b = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                _id\n                k\n                l\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                _id\n                k\n                l\n              }\n            }\n          }\n        "], gql(_b)),
                data: {
                    g: 8,
                    h: 9,
                    bar: { i: 10, j: 11, foo: { _id: 'barfoo', k: 12, l: 13 } },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    g: 8,
                    h: 9,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.bar',
                        generated: true,
                    },
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo': {
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: 'bar:foobar',
                        generated: false,
                    },
                },
                '$ROOT_QUERY.bar': {
                    i: 10,
                    j: 11,
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.bar.foo',
                        generated: true,
                    },
                },
                'bar:foobar': {
                    id: 'foobar',
                    e: 5,
                    f: 6,
                },
                '$ROOT_QUERY.bar.foo': {
                    _id: 'barfoo',
                    k: 12,
                    l: 13,
                },
            });
            var _a, _b;
        });
        it('will use a default id getter if one is not specified and __typename is present along with either _id or id', function () {
            var client = new ApolloClient({
                initialState: { apollo: { data: {} } },
            });
            client.writeQuery({
                query: (_a = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], _a.raw = ["\n          {\n            a\n            b\n            foo {\n              c\n              d\n              bar {\n                id\n                e\n                f\n              }\n            }\n          }\n        "], gql(_a)),
                data: {
                    a: 1,
                    b: 2,
                    foo: {
                        __typename: 'foo',
                        c: 3,
                        d: 4,
                        bar: { __typename: 'bar', id: 'foobar', e: 5, f: 6 },
                    },
                },
            });
            client.writeQuery({
                query: (_b = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                _id\n                k\n                l\n              }\n            }\n          }\n        "], _b.raw = ["\n          {\n            g\n            h\n            bar {\n              i\n              j\n              foo {\n                _id\n                k\n                l\n              }\n            }\n          }\n        "], gql(_b)),
                data: {
                    g: 8,
                    h: 9,
                    bar: {
                        __typename: 'bar',
                        i: 10,
                        j: 11,
                        foo: { __typename: 'foo', _id: 'barfoo', k: 12, l: 13 },
                    },
                },
            });
            assert.deepEqual(client.store.getState().apollo.data, {
                ROOT_QUERY: {
                    a: 1,
                    b: 2,
                    g: 8,
                    h: 9,
                    bar: {
                        type: 'id',
                        id: '$ROOT_QUERY.bar',
                        generated: true,
                    },
                    foo: {
                        type: 'id',
                        id: '$ROOT_QUERY.foo',
                        generated: true,
                    },
                },
                '$ROOT_QUERY.foo': {
                    __typename: 'foo',
                    c: 3,
                    d: 4,
                    bar: {
                        type: 'id',
                        id: 'bar:foobar',
                        generated: false,
                    },
                },
                '$ROOT_QUERY.bar': {
                    __typename: 'bar',
                    i: 10,
                    j: 11,
                    foo: {
                        type: 'id',
                        id: 'foo:barfoo',
                        generated: false,
                    },
                },
                'bar:foobar': {
                    __typename: 'bar',
                    id: 'foobar',
                    e: 5,
                    f: 6,
                },
                'foo:barfoo': {
                    __typename: 'foo',
                    _id: 'barfoo',
                    k: 12,
                    l: 13,
                },
            });
            var _a, _b;
        });
    });
});
//# sourceMappingURL=ApolloClient.js.map