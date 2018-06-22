import { checkDocument, getFragmentDefinitions, getQueryDefinition, getMutationDefinition, createFragmentMap, getDefaultValues, getOperationName, getFragmentQueryDocument, } from '../src/queries/getFromAST';
import { print } from 'graphql/language/printer';
import gql from 'graphql-tag';
import { assert } from 'chai';
describe('AST utility functions', function () {
    it('should correctly check a document for correctness', function () {
        var multipleQueries = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n\n      query {\n        author {\n          address\n        }\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n\n      query {\n        author {\n          address\n        }\n      }\n    "], gql(_a));
        assert.throws(function () {
            checkDocument(multipleQueries);
        });
        var namedFragment = (_b = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], gql(_b));
        assert.doesNotThrow(function () {
            checkDocument(namedFragment);
        });
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a single fragment', function () {
        var singleFragmentDefinition = (_a = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], gql(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], gql(_b));
        var expectedResult = [
            expectedDoc.definitions[0],
        ];
        var actualResult = getFragmentDefinitions(singleFragmentDefinition);
        assert.equal(actualResult.length, expectedResult.length);
        assert.equal(print(actualResult[0]), print(expectedResult[0]));
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a multiple fragments', function () {
        var multipleFragmentDefinitions = (_a = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], gql(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], gql(_b));
        var expectedResult = [
            expectedDoc.definitions[0],
            expectedDoc.definitions[1],
        ];
        var actualResult = getFragmentDefinitions(multipleFragmentDefinitions);
        assert.deepEqual(actualResult.map(print), expectedResult.map(print));
        var _a, _b;
    });
    it('should get the correct query definition out of a query containing multiple fragments', function () {
        var queryWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], gql(_a));
        var expectedDoc = (_b = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], gql(_b));
        var expectedResult = expectedDoc
            .definitions[0];
        var actualResult = getQueryDefinition(queryWithFragments);
        assert.equal(print(actualResult), print(expectedResult));
        var _a, _b;
    });
    it('should throw if we try to get the query definition of a document with no query', function () {
        var mutationWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], gql(_a));
        assert.throws(function () {
            getQueryDefinition(mutationWithFragments);
        });
        var _a;
    });
    it('should get the correct mutation definition out of a mutation with multiple fragments', function () {
        var mutationWithFragments = (_a = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _a.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], gql(_a));
        var expectedDoc = (_b = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], _b.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], gql(_b));
        var expectedResult = expectedDoc
            .definitions[0];
        var actualResult = getMutationDefinition(mutationWithFragments);
        assert.equal(print(actualResult), print(expectedResult));
        var _a, _b;
    });
    it('should create the fragment map correctly', function () {
        var fragments = getFragmentDefinitions((_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], gql(_a)));
        var fragmentMap = createFragmentMap(fragments);
        var expectedTable = {
            authorDetails: fragments[0],
            moreAuthorDetails: fragments[1],
        };
        assert.deepEqual(fragmentMap, expectedTable);
        var _a;
    });
    it('should return an empty fragment map if passed undefined argument', function () {
        assert.deepEqual(createFragmentMap(undefined), {});
    });
    it('should get the operation name out of a query', function () {
        var query = (_a = ["\n      query nameOfQuery {\n        fortuneCookie\n      }\n    "], _a.raw = ["\n      query nameOfQuery {\n        fortuneCookie\n      }\n    "], gql(_a));
        var operationName = getOperationName(query);
        assert.equal(operationName, 'nameOfQuery');
        var _a;
    });
    it('should get the operation name out of a mutation', function () {
        var query = (_a = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }\n    "], _a.raw = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }\n    "], gql(_a));
        var operationName = getOperationName(query);
        assert.equal(operationName, 'nameOfMutation');
        var _a;
    });
    it('should return null if the query does not have an operation name', function () {
        var query = (_a = ["\n      {\n        fortuneCookie\n      }\n    "], _a.raw = ["\n      {\n        fortuneCookie\n      }\n    "], gql(_a));
        var operationName = getOperationName(query);
        assert.equal(operationName, null);
        var _a;
    });
    it('should throw if type definitions found in document', function () {
        var queryWithTypeDefination = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }\n    "], gql(_a));
        assert.throws(function () {
            getQueryDefinition(queryWithTypeDefination);
        }, 'Schema type definitions not allowed in queries. Found: "InputObjectTypeDefinition"');
        var _a;
    });
    describe('getFragmentQueryDocument', function () {
        it('will throw an error if there is an operation', function () {
            assert.throws(function () {
                return getFragmentQueryDocument((_a = ["\n              {\n                a\n                b\n                c\n              }\n            "], _a.raw = ["\n              {\n                a\n                b\n                c\n              }\n            "], gql(_a)));
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                return getFragmentQueryDocument((_a = ["\n              query {\n                a\n                b\n                c\n              }\n            "], _a.raw = ["\n              query {\n                a\n                b\n                c\n              }\n            "], gql(_a)));
                var _a;
            }, 'Found a query operation. No operations are allowed when using a fragment as a query. Only fragments are allowed.');
            assert.throws(function () {
                return getFragmentQueryDocument((_a = ["\n              query Named {\n                a\n                b\n                c\n              }\n            "], _a.raw = ["\n              query Named {\n                a\n                b\n                c\n              }\n            "], gql(_a)));
                var _a;
            }, "Found a query operation named 'Named'. No operations are allowed when using a fragment as a query. Only fragments are allowed.");
            assert.throws(function () {
                return getFragmentQueryDocument((_a = ["\n              mutation Named {\n                a\n                b\n                c\n              }\n            "], _a.raw = ["\n              mutation Named {\n                a\n                b\n                c\n              }\n            "], gql(_a)));
                var _a;
            }, "Found a mutation operation named 'Named'. No operations are allowed when using a fragment as a query. " +
                'Only fragments are allowed.');
            assert.throws(function () {
                return getFragmentQueryDocument((_a = ["\n              subscription Named {\n                a\n                b\n                c\n              }\n            "], _a.raw = ["\n              subscription Named {\n                a\n                b\n                c\n              }\n            "], gql(_a)));
                var _a;
            }, "Found a subscription operation named 'Named'. No operations are allowed when using a fragment as a query. " +
                'Only fragments are allowed.');
        });
        it('will throw an error if there is not exactly one fragment but no `fragmentName`', function () {
            assert.throws(function () {
                getFragmentQueryDocument((_a = ["\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n          }\n        "], _a.raw = ["\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n          }\n        "], gql(_a)));
                var _a;
            }, 'Found 2 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                getFragmentQueryDocument((_a = ["\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n          }\n        "], _a.raw = ["\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n          }\n        "], gql(_a)));
                var _a;
            }, 'Found 3 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
            assert.throws(function () {
                getFragmentQueryDocument((_a = ["\n          scalar Foo\n        "], _a.raw = ["\n          scalar Foo\n        "], gql(_a)));
                var _a;
            }, 'Found 0 fragments. `fragmentName` must be provided when there is not exactly 1 fragment.');
        });
        it('will create a query document where the single fragment is spread in the root query', function () {
            assert.deepEqual(print(getFragmentQueryDocument((_a = ["\n            fragment foo on Foo {\n              a\n              b\n              c\n            }\n          "], _a.raw = ["\n            fragment foo on Foo {\n              a\n              b\n              c\n            }\n          "], gql(_a)))), print((_b = ["\n          {\n            ...foo\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n        "], _b.raw = ["\n          {\n            ...foo\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n        "], gql(_b))));
            var _a, _b;
        });
        it('will create a query document where the named fragment is spread in the root query', function () {
            assert.deepEqual(print(getFragmentQueryDocument((_a = ["\n              fragment foo on Foo {\n                a\n                b\n                c\n              }\n\n              fragment bar on Bar {\n                d\n                e\n                f\n                ...foo\n              }\n\n              fragment baz on Baz {\n                g\n                h\n                i\n                ...foo\n                ...bar\n              }\n            "], _a.raw = ["\n              fragment foo on Foo {\n                a\n                b\n                c\n              }\n\n              fragment bar on Bar {\n                d\n                e\n                f\n                ...foo\n              }\n\n              fragment baz on Baz {\n                g\n                h\n                i\n                ...foo\n                ...bar\n              }\n            "], gql(_a)), 'foo')), print((_b = ["\n          {\n            ...foo\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n            ...foo\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n            ...foo\n            ...bar\n          }\n        "], _b.raw = ["\n          {\n            ...foo\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n            ...foo\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n            ...foo\n            ...bar\n          }\n        "], gql(_b))));
            assert.deepEqual(print(getFragmentQueryDocument((_c = ["\n              fragment foo on Foo {\n                a\n                b\n                c\n              }\n\n              fragment bar on Bar {\n                d\n                e\n                f\n                ...foo\n              }\n\n              fragment baz on Baz {\n                g\n                h\n                i\n                ...foo\n                ...bar\n              }\n            "], _c.raw = ["\n              fragment foo on Foo {\n                a\n                b\n                c\n              }\n\n              fragment bar on Bar {\n                d\n                e\n                f\n                ...foo\n              }\n\n              fragment baz on Baz {\n                g\n                h\n                i\n                ...foo\n                ...bar\n              }\n            "], gql(_c)), 'bar')), print((_d = ["\n          {\n            ...bar\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n            ...foo\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n            ...foo\n            ...bar\n          }\n        "], _d.raw = ["\n          {\n            ...bar\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n            ...foo\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n            ...foo\n            ...bar\n          }\n        "], gql(_d))));
            assert.deepEqual(print(getFragmentQueryDocument((_e = ["\n              fragment foo on Foo {\n                a\n                b\n                c\n              }\n\n              fragment bar on Bar {\n                d\n                e\n                f\n                ...foo\n              }\n\n              fragment baz on Baz {\n                g\n                h\n                i\n                ...foo\n                ...bar\n              }\n            "], _e.raw = ["\n              fragment foo on Foo {\n                a\n                b\n                c\n              }\n\n              fragment bar on Bar {\n                d\n                e\n                f\n                ...foo\n              }\n\n              fragment baz on Baz {\n                g\n                h\n                i\n                ...foo\n                ...bar\n              }\n            "], gql(_e)), 'baz')), print((_f = ["\n          {\n            ...baz\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n            ...foo\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n            ...foo\n            ...bar\n          }\n        "], _f.raw = ["\n          {\n            ...baz\n          }\n\n          fragment foo on Foo {\n            a\n            b\n            c\n          }\n\n          fragment bar on Bar {\n            d\n            e\n            f\n            ...foo\n          }\n\n          fragment baz on Baz {\n            g\n            h\n            i\n            ...foo\n            ...bar\n          }\n        "], gql(_f))));
            var _a, _b, _c, _d, _e, _f;
        });
    });
    describe('getDefaultValues', function () {
        it('will create an empty variable object if no default values are provided', function () {
            var basicQuery = (_a = ["\n        query people($first: Int, $second: String) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], _a.raw = ["\n        query people($first: Int, $second: String) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], gql(_a));
            assert.deepEqual(getDefaultValues(getQueryDefinition(basicQuery)), {});
            var _a;
        });
        it('will create a variable object based on the definition node with default values', function () {
            var basicQuery = (_a = ["\n        query people($first: Int = 1, $second: String!) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], _a.raw = ["\n        query people($first: Int = 1, $second: String!) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], gql(_a));
            var complexMutation = (_b = ["\n        mutation complexStuff(\n          $test: Input = { key1: [\"value\", \"value2\"], key2: { key3: 4 } }\n        ) {\n          complexStuff(test: $test) {\n            people {\n              name\n            }\n          }\n        }\n      "], _b.raw = ["\n        mutation complexStuff(\n          $test: Input = { key1: [\"value\", \"value2\"], key2: { key3: 4 } }\n        ) {\n          complexStuff(test: $test) {\n            people {\n              name\n            }\n          }\n        }\n      "], gql(_b));
            assert.deepEqual(getDefaultValues(getQueryDefinition(basicQuery)), {
                first: 1,
            });
            assert.deepEqual(getDefaultValues(getMutationDefinition(complexMutation)), { test: { key1: ['value', 'value2'], key2: { key3: 4 } } });
            var _a, _b;
        });
    });
});
//# sourceMappingURL=getFromAST.js.map