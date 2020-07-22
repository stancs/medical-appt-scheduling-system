const { mongoose } = require('../../src/configs/db');

async function dropDatabase() {
    mongoose.connection.once('open', () => {
        console.log('Dropping all database...');
        mongoose.connection.dropDatabase();
    });
    process.exit(0);
}

dropDatabase();
