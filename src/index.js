const { ApolloServer } = require('apollo-server');
require('./config');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== 'test') {
    server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
        console.log(`🚀 app running at ${url}`);
    });
}

// export all the important pieces for integration/e2e tests to use
module.exports = {
    typeDefs,
    resolvers,
    ApolloServer,
    server,
};
