const chalk = require('chalk');
const { ApolloServer } = require('apollo-server');

require('./configs/db');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== 'test') {
    server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
        console.log(`🚀 ${chalk.bold.yellow(`Scheduling App running at `)}${chalk.magenta(url)}`);
    });
}

// export all the important pieces for integration test to use
module.exports = {
    typeDefs,
    resolvers,
    ApolloServer,
    server,
};
