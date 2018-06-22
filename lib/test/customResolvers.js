import mockNetworkInterface from './mocks/mockNetworkInterface';
import gql from 'graphql-tag';
import { assert } from 'chai';
import ApolloClient, { toIdValue } from '../src';
import { NetworkStatus } from '../src/queries/networkStatus';
describe('custom resolvers', function () {
    it("works for cache redirection", function () {
        var dataIdFromObject = function (obj) {
            return obj.id;
        };
        var listQuery = (_a = ["\n      {\n        people {\n          id\n          name\n        }\n      }\n    "], _a.raw = ["\n      {\n        people {\n          id\n          name\n        }\n      }\n    "], gql(_a));
        var listData = {
            people: [
                {
                    id: '4',
                    name: 'Luke Skywalker',
                    __typename: 'Person',
                },
            ],
        };
        var netListQuery = (_b = ["\n      {\n        people {\n          id\n          name\n          __typename\n        }\n      }\n    "], _b.raw = ["\n      {\n        people {\n          id\n          name\n          __typename\n        }\n      }\n    "], gql(_b));
        var itemQuery = (_c = ["\n      {\n        person(id: 4) {\n          id\n          name\n        }\n      }\n    "], _c.raw = ["\n      {\n        person(id: 4) {\n          id\n          name\n        }\n      }\n    "], gql(_c));
        var networkInterface = mockNetworkInterface({
            request: { query: netListQuery },
            result: { data: listData },
        });
        var client = new ApolloClient({
            networkInterface: networkInterface,
            customResolvers: {
                Query: {
                    person: function (_, args) { return toIdValue(args['id']); },
                },
            },
            dataIdFromObject: dataIdFromObject,
        });
        return client
            .query({ query: listQuery })
            .then(function () {
            return client.query({ query: itemQuery });
        })
            .then(function (itemResult) {
            assert.deepEqual(itemResult, {
                loading: false,
                networkStatus: NetworkStatus.ready,
                stale: false,
                data: {
                    person: {
                        __typename: 'Person',
                        id: '4',
                        name: 'Luke Skywalker',
                    },
                },
            });
        });
        var _a, _b, _c;
    });
});
//# sourceMappingURL=customResolvers.js.map