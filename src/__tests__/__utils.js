const { HttpLink } = require('apollo-link-http');
const { execute, toPromise } = require('apollo-link');
const fetch = require('node-fetch');

const { typeDefs, resolvers, ApolloServer } = require('../');
const { Patient, Provider, Appointment } = require('../../src/models');

const cleanDb = async () => {
    const models = [Patient, Provider, Appointment];

    for (const model of models) {
        const res = await model.deleteMany({}).exec();
        console.log(
            `[DeleteAll] model = ${model.collection.collectionName}, isSuccess: ${res.ok}, deletedCount: ${res.deletedCount}`,
        );
    }
};

/**
 * Integration testing utils
 */
const constructTestServer = () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    return { server };
};

/**
 * e2e Testing Utils
 */

const startTestServer = async server => {
    // if using apollo-server-express...
    // const app = express();
    // server.applyMiddleware({ app });
    // const httpServer = await app.listen(0);

    const httpServer = await server.listen({ port: 0 });

    const link = new HttpLink({
        uri: `http://localhost:${httpServer.port}`,
        fetch,
    });

    const executeOperation = ({ query, variables = {} }) => execute(link, { query, variables });

    return {
        link,
        stop: () => httpServer.server.close(),
        graphql: executeOperation,
    };
};

module.exports = {
    cleanDb,
    constructTestServer,
    startTestServer,
    toPromise,
};
