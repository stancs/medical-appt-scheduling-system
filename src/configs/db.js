const chalk = require('chalk');
const mongoose = require('mongoose');
const uriFormat = require('mongodb-uri');

mongoose.Promise = global.Promise;

/**
 * Encoding Mongo URI string
 *
 * @param {string} urlString URL String
 */
const encodeMongoURI = urlString => {
    if (urlString) {
        const parsed = uriFormat.parse(urlString);

        const [firstHost] = parsed.hosts;

        // Show Mongo DB essential information
        console.log(
            `[Mongo DB] database: ${chalk.bold.red(parsed.database)}, host: ${chalk.bold.green(
                firstHost.host,
            )}, username: ${chalk.bold.yellow(parsed.username)}, port: ${chalk.bold.blue(
                firstHost.port || '27017 (default)',
            )}`,
        );

        const encodedUrlString = uriFormat.format(parsed);

        return encodedUrlString;
    }
};

let dbUrl;
// For test, we use separate remote Mongo DB
if (process.env.NODE_ENV === 'test') {
    dbUrl = process.env.MONGO_DB_TEST_URL;
} else {
    dbUrl = process.env.MONGO_DB_REMOTE_URL;
}
// Encode connection string to be safe since some password might not be accepted
// https://mongoosejs.com/docs/migrating_to_5.html
const encodedMongoURI = encodeMongoURI(dbUrl);

mongoose.connect(encodedMongoURI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once('open', () => console.log(`${chalk.bold.green(' ✓ Connected to Mongo DB')}`));

module.exports = {
    mongoose,
};
