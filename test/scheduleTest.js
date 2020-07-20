const { createTestClient } = require('apollo-server-testing');
const faker = require('faker');
const gql = require('graphql-tag');
const util = require('util');

const { ApolloServer } = require('apollo-server');
require('../src/config');

const typeDefs = require('../src/schema');
const resolvers = require('../src/resolvers');
const { getDayOfWeek, getHHMM, tz } = require('../src/utils/dates');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});

const { query, mutate } = createTestClient(server);

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

const ADD_PATIENT = gql`
    mutation addPatient($userName: String!, $firstName: String!, $lastName: String!, $email: String, $phone: String) {
        addPatient(userName: $userName, firstName: $firstName, lastName: $lastName, email: $email, phone: $phone) {
            id
            userName
            firstName
            lastName
            email
            phone
        }
    }
`;

const ADD_PROVIDER = gql`
    mutation addProvider(
        $userName: String!
        $firstName: String!
        $lastName: String!
        $email: String
        $phone: String
        $addressLine1: String
        $addressLine2: String
        $city: String
        $state: String
        $county: String
        $zipCode: String
        $isAcceptingNewPatient: Boolean
        $languageSpoken: [String]
        $npi: String
        $education: JSONObject
        $biography: String
        $affiliation: JSONObject
        $regularShift: JSONObject
        $scheduledShifts: [JSONObject]
        $blockedShifts: [JSONObject]
        $timeZone: String
    ) {
        addProvider(
            userName: $userName
            firstName: $firstName
            lastName: $lastName
            email: $email
            phone: $phone
            addressLine1: $addressLine1
            addressLine2: $addressLine2
            city: $city
            state: $state
            county: $county
            zipCode: $zipCode
            isAcceptingNewPatient: $isAcceptingNewPatient
            languageSpoken: $languagesSpoken
            npi: $npi
            education: $education
            biography: $biography
            affiliation: $affiliation
            regularShift: $regularShift
            scheduledShifts: $scheduledShifts
            blockedShifts: $blockedShifts
            timeZone: $timeZone
        ) {
            id
            userName
            firstName
            lastName
            email
            phone
        }
    }
`;

async function test() {
    // const res = await query({
    //     query: ADD_PATIENT,
    //     variables: {
    //         userName: 'avery1234',
    //         firstName: 'Avery',
    //         lastName: 'Lee',
    //         email: 'avery@yopmail.com',
    //         phone: '512-112-2222',
    //     },
    // });

    // console.log(util.inspect(res, false, 10, true));

    console.log(typeDefs);

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

    const res = await query({
        query: ADD_PROVIDER,
        variables: {
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
        },
    });

    console.log(util.inspect(res, false, 10, true));

    // mutate({
    //     mutation: UPDATE_USER,
    //     variables: { id: 1, email: 'nancy@foo.co' },
    // });
    process.exit(0);
}

test();
