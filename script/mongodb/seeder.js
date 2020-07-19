const faker = require('faker');
const util = require('util');

require('../../src/config');
const { Patient, Provider, Appointment } = require('../../src/models');
const { getDayOfWeek, getHHMM, tz } = require('../../src/utils/dates');

// Adjust these numbers to create more patients and providers
const numPatients = 0;
const numProviders = 1;

const numAppointments = 0;

async function addPatients() {
    for (let i = 0; i < numPatients; i++) {
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
        // console.log('[Patient Info]');
        // console.log(patientInfo);

        try {
            const res = await Patient.create(patientInfo);
            console.log(res);
        } catch (err) {
            console.error(err);
        }
    }
}

async function addProviders() {
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

    for (let i = 0; i < numProviders; i++) {
        const regularShift = {};
        for (let j = 0; j < 4; j++) {
            const dayOfWeek = getDayOfWeek(faker.random.number(6));
            if (!regularShift[dayOfWeek]) {
                regularShift[dayOfWeek] = getDayShift();
            }
        }
        console.log('regularShift');
        console.log(regularShift);

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
            languageSpoken: ['English'],
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
            console.log(util.inspect(res, false, 10, true));
        } catch (err) {
            console.error(err);
        }
    }
}

async function getPatients() {
    return await Patient.find({}).exec();
}

async function getProviders() {
    return await Provider.find({}).exec();
}

async function addAppointments(patients, providers) {
    const now = new Date();

    for (let i = 0; i < numAppointments; i++) {
        const patientIdx = faker.random.number(patients.length - 1);
        const providerIdx = faker.random.number(providers.length - 1);

        const appointmentInfo = {
            patient: patients[patientIdx]._id,
            provider: providers[providerIdx]._id,
            startDateTime: new Date(2020, 06, 19, 14, 30, 0, 0),
            endDateTime: new Date(2020, 06, 19, 15, 30, 0, 0),
            location: 'Anderson/Austin, TX',
            room: 'Rm8',
        };

        try {
            const res = await Appointment.create(appointmentInfo);
            console.log(res);
        } catch (err) {
            console.error(err);
        }
    }
}

async function generate() {
    await addPatients();
    await addProviders();

    if (numAppointments > 0) {
        const patients = await getPatients();
        const providers = await getProviders();

        await addAppointments(patients, providers);
    }
    process.exit(0);
}

generate();
