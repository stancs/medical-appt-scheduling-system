const { createTestClient } = require('apollo-server-testing');
const gql = require('graphql-tag');
const util = require('util');

const { ApolloServer } = require('apollo-server');
require('../src/config');

const typeDefs = require('../src/schema');
const resolvers = require('../src/resolvers');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});

const { query, mutate } = createTestClient(server);

const GET_PROVIDERS = gql`
    query {
        getProviders {
            id
            userName
            firstName
            lastName
            email
        }
    }
`;

async function test() {
    const res = await query({
        query: GET_PROVIDERS,
        variables: {},
    });

    console.log(util.inspect(res, false, 10, true));

    // mutate({
    //     mutation: UPDATE_USER,
    //     variables: { id: 1, email: 'nancy@foo.co' },
    // });
}

test();
