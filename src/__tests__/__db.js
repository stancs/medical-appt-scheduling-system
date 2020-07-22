const faker = require('faker');
const util = require('util');

require('../../src/configs/db');
const { Patient, Provider, Appointment } = require('../../src/models');
const { getDayOfWeek, getHHMM } = require('../utils/dates');

async function addPatients(num) {
    const dbResults = [];
    for (let i = 0; i < num; i++) {
        const fakeSsn = `${faker.random.number({ min: 100, max: 999 })}-${faker.random.number({
            min: 10,
            max: 99,
        })}-${faker.random.number({ min: 1000, max: 9999 })}`;
        const randomPast = faker.date.past(10, '1998-01-01');

        const patientInfo = {
            userName: faker.internet.userName(),
            firstName: faker.name.firstName(),
            middleName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.phoneNumberFormat(0),
            ssn: fakeSsn,
            addressLine1: faker.address.streetAddress('###'),
            addressLine2: faker.address.secondaryAddress(),
            city: faker.address.city(),
            state: faker.address.stateAbbr(),
            county: faker.address.county(),
            zipCode: faker.address.zipCode('#####'),
            isSmoker: faker.random.boolean(),
            birthday: randomPast.toISOString().slice(0, 10),
        };

        try {
            const res = await Patient.create(patientInfo);
            dbResults.push(res);
        } catch (err) {
            console.error(err);
        }
    }
    return dbResults;
}

async function addProviders(num) {
    const dbResults = [];
    const getDayShift = () => [
        {
            start: getHHMM(faker.random.number({ min: 7, max: 10 }), 0),
            end: getHHMM(faker.random.number({ min: 11, max: 12 }), 0),
        },
        {
            start: getHHMM(faker.random.number({ min: 13, max: 14 }), 0),
            end: getHHMM(faker.random.number({ min: 17, max: 19 }), 0),
        },
    ];

    for (let i = 0; i < num; i++) {
        const regularShift = {};
        for (let j = 0; j < 4; j++) {
            const dayOfWeek = getDayOfWeek(faker.random.number(6));
            if (!regularShift[dayOfWeek]) {
                regularShift[dayOfWeek] = getDayShift();
            }
        }

        const scheduledShifts = [];

        const scheduledShift = {};
        for (let j = 0; j < 4; j++) {
            const dayOfWeek = getDayOfWeek(faker.random.number(6));
            if (!scheduledShift[dayOfWeek]) {
                scheduledShift[dayOfWeek] = getDayShift();
            }
        }

        const timeZone = 'America/Chicago';

        const scheduled = {
            startDate: faker.date.between('2020-10-01', '2020-10-05').toISOString().slice(0, 10),
            endDate: faker.date.between('2020-10-20', '2020-10-25').toISOString().slice(0, 10),
            shift: scheduledShift,
        };
        scheduledShifts.push(scheduled);

        const blocked = {
            startDate: faker.date.between('2020-10-01', '2020-10-05').toISOString().slice(0, 10),
            endDate: faker.date.between('2020-10-20', '2020-10-25').toISOString().slice(0, 10),
        };

        const blockedShifts = [];
        blockedShifts.push(blocked);

        const providerInfo = {
            userName: faker.internet.userName(),
            firstName: faker.name.firstName(),
            middleName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            degree: 'MD',
            email: faker.internet.email(),
            phone: faker.phone.phoneNumberFormat(0),
            addressLine1: faker.address.streetAddress('###'),
            addressLine2: faker.address.secondaryAddress(),
            city: faker.address.city(),
            state: faker.address.stateAbbr(),
            county: faker.address.county(),
            zipCode: faker.address.zipCode('#####'),
            isAcceptingNewPatient: faker.random.boolean(),
            languagesSpoken: ['English'],
            npi: faker.random.alphaNumeric(10),
            education: {
                medicalSchool: faker.company.companyName(0),
                residency: faker.company.companyName(),
            },
            biography: faker.hacker.phrase(),
            affiliation: {
                medicalGroup: faker.company.companyName(),
                hospital: faker.company.companyName(),
            },
            regularShift,
            scheduledShifts,
            blockedShifts,
            timeZone,
        };

        try {
            const res = await Provider.create(providerInfo);
            dbResults.push(res);
        } catch (err) {
            console.error(err);
        }
    }
    return dbResults;
}

async function getPatients() {
    return await Patient.find({}).exec();
}

async function getProviders() {
    return await Provider.find({}).exec();
}

async function addAppointments(patients, providers, num) {
    const now = new Date();
    const nowUnixTimestamp = now.getTime();
    const monthLaterUnixTimestamp = new Date(now).setMonth(now.getMonth() + 1);

    for (let i = 0; i < num; i++) {
        const patientIdx = faker.random.number(patients.length - 1);
        const providerIdx = faker.random.number(providers.length - 1);
        const randomStartUnixTimestamp = faker.random.number({ min: nowUnixTimestamp, max: monthLaterUnixTimestamp });
        const randomEndUnixTimestamp = randomStartUnixTimestamp + 60 * 60 * 1000; // 1 hour later

        const appointmentInfo = {
            patient: patients[patientIdx]._id,
            provider: providers[providerIdx]._id,
            startDateTime: new Date(randomStartUnixTimestamp),
            endDateTime: new Date(randomEndUnixTimestamp),
            location: 'Anderson/Austin, TX',
            room: 'Rm8',
        };

        try {
            const res = await Appointment.create(appointmentInfo);
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    addPatients,
    addProviders,
    addAppointments,
    getPatients,
    getProviders,
};
