require('../../src/configs/db');
const { Patient, Provider, Appointment } = require('../../src/models');

const models = [Patient, Provider, Appointment];

async function deleteAll() {
    for (const model of models) {
        const res = await model.deleteMany({}).exec();
        console.log(
            `model = ${model.collection.collectionName}, isSuccess: ${res.ok}, deletedCount: ${res.deletedCount}`,
        );
    }
    process.exit(0);
}

deleteAll();
