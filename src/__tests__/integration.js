const { createTestClient } = require('apollo-server-testing');
const gql = require('graphql-tag');
const util = require('util');

const { constructTestServer } = require('./__utils');

const GET_PATIENTS = gql`
    query {
        getPatients {
            id
            userName
            firstName
            lastName
            email
            phone
            addressLine1
            addressLine2
            city
            state
            county
            zipCode
            isSmoker
            birthday
        }
    }
`;

const GET_PROVIDERS = gql`
    query {
        getProviders {
            id
            userName
            firstName
            middleName
            lastName
            email
            phone
            addressLine1
            addressLine2
            city
            state
            county
            zipCode
            isAcceptingNewPatient
            languagesSpoken
            npi
            education {
                medicalSchool
                residency
            }
            biography
            affiliation {
                medicalGroup
                hospital
            }
            regularShift
            scheduledShifts {
                startDate
                endDate
                shift
            }
            blockedShifts {
                startDate
                endDate
                shift
            }
            timeZone
        }
    }
`;

const ADD_PATIENT = gql`
    mutation addPatient($input: PatientInput) {
        addPatient(input: $input) {
            id
            userName
            firstName
            middleName
            lastName
            email
            phone
            addressLine1
            addressLine2
            city
            state
            county
            zipCode
            isSmoker
            birthday
        }
    }
`;

const ADD_PROVIDER = gql`
    mutation addProvider($input: ProviderInput) {
        addProvider(input: $input) {
            id
            userName
            firstName
            middleName
            lastName
            email
            phone
            addressLine1
            addressLine2
            city
            state
            county
            zipCode
            isAcceptingNewPatient
            languagesSpoken
            npi
            education {
                medicalSchool
                residency
            }
            biography
            affiliation {
                medicalGroup
                hospital
            }
            regularShift
            scheduledShifts {
                startDate
                endDate
                shift
            }
            blockedShifts {
                startDate
                endDate
                shift
            }
            timeZone
        }
    }
`;

const ADD_APPOINTMENT = gql`
    mutation addAppointment($input: AppointmentInput) {
        addAppointment(input: $input) {
            id
            patient
            provider
            startDateTime
            endDateTime
            location
            room
        }
    }
`;

describe.skip('Queries', () => {
    it.skip('fetches list of patients', async () => {
        // create an instance of ApolloServer that mocks out context, while reusing
        // existing dataSources, resolvers, and typeDefs.
        const { server } = constructTestServer();

        // use our test server as input to the createTestClient fn
        // This will give us an interface, similar to apolloClient.query
        // to run queries against our instance of ApolloServer
        const { query } = createTestClient(server);
        const res = await query({ query: GET_PATIENTS });
        // expect(res).toMatchSnapshot();
        console.log(util.inspect(res.data.getPatients, false, 10, true));
    });

    it.skip('fetches list of providers', async () => {
        // create an instance of ApolloServer that mocks out context, while reusing
        // existing dataSources, resolvers, and typeDefs.
        const { server } = constructTestServer();

        // use our test server as input to the createTestClient fn
        // This will give us an interface, similar to apolloClient.query
        // to run queries against our instance of ApolloServer
        const { query } = createTestClient(server);
        const res = await query({ query: GET_PROVIDERS });
        // expect(res).toMatchSnapshot();
        console.log(util.inspect(res.data.getProviders, false, 10, true));
    });
});

describe('Mutations', () => {
    it('adds a patient', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);
        const res = await mutate({
            mutation: ADD_PATIENT,
            variables: {
                input: {
                    userName: 'avery1234',
                    firstName: 'Avery',
                    middleName: 'Eva',
                    lastName: 'Lee',
                    email: 'avery@yopmail.com',
                    phone: '512-112-2222',
                    addressLine1: '2000 Blackthorn Dr',
                    addressLine2: 'Rm 101',
                    city: 'Pflugerville',
                    state: 'TX',
                    county: 'Travis County',
                    zipCode: '78660',
                    isSmoker: false,
                    birthday: '2018-12-11',
                },
            },
        });
        // expect(res.data.login.token).toEqual('YUBhLmE=');
        console.log(util.inspect(res.data.addPatient, false, 10, true));
    });

    it('adds a provider', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);
        const res = await mutate({
            mutation: ADD_PROVIDER,
            variables: {
                input: {
                    userName: 'christian1234',
                    firstName: 'Christian',
                    middleName: 'Lydia',
                    lastName: 'Dovis',
                    email: 'christian@yopmail.com',
                    phone: '512-112-2222',
                    addressLine1: '1235 Blackthorn Dr',
                    addressLine2: 'Rm 101',
                    city: 'Pflugerville',
                    state: 'TX',
                    county: 'Travis County',
                    zipCode: '78660',
                    isAcceptingNewPatient: true,
                    languagesSpoken: ['English', 'Spanish'],
                    npi: '1234234',
                    education: {
                        medicalSchool: 'Harvard University',
                        residency: 'Yale University',
                    },
                    biography: 'I studied hard',
                    affiliation: {
                        medicalGroup: 'Saint Andrew Medical Group',
                        hospital: 'Saint Paul Hospital',
                    },
                    regularShift: {
                        Monday: [
                            {
                                start: '09:00',
                                end: '12:00',
                            },
                            {
                                start: '13:00',
                                end: '17:00',
                            },
                        ],
                        Tuesday: [
                            {
                                start: '09:00',
                                end: '12:00',
                            },
                            {
                                start: '13:00',
                                end: '17:00',
                            },
                        ],
                        Wednesday: [
                            {
                                start: '09:00',
                                end: '12:00',
                            },
                            {
                                start: '13:00',
                                end: '17:00',
                            },
                        ],
                    },
                    scheduledShifts: [
                        {
                            startDate: '2020-10-01',
                            endDate: '2020-10-30',
                            shift: {
                                Monday: [
                                    {
                                        start: '09:00',
                                        end: '12:00',
                                    },
                                    {
                                        start: '13:00',
                                        end: '18:00',
                                    },
                                ],
                                Tuesday: [
                                    {
                                        start: '09:00',
                                        end: '12:00',
                                    },
                                    {
                                        start: '13:00',
                                        end: '18:00',
                                    },
                                ],
                                Wednesday: [
                                    {
                                        start: '09:00',
                                        end: '12:00',
                                    },
                                    {
                                        start: '13:00',
                                        end: '18:00',
                                    },
                                ],
                            },
                        },
                    ],
                    blockedShifts: [
                        {
                            startDate: '2020-10-10',
                            endDate: '2020-10-13',
                        },
                    ],
                    timeZone: 'America/Chicago',
                },
            },
        });
        // expect(res.data.login.token).toEqual('YUBhLmE=');
        console.log(util.inspect(res.data.addProvider, false, 10, true));
    });

    it('adds an appointment', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input: {
                    patient: '5f15fa10be9019eb91c1f39b',
                    provider: '5f15fa10be9019eb91c1f39c',
                    startDateTime: '2020-10-20T15:00:00Z',
                    endDateTime: '2020-10-20T16:00:00Z',
                    location: 'Anderson Mill-Austin, TX',
                    room: 'Rm10',
                },
            },
        });
        // expect(res.data.login.token).toEqual('YUBhLmE=');
        console.log(util.inspect(res.data.addAppointment, false, 10, true));
    });
});

describe.skip('Cases for adding an appointment', () => {
    it('attemps to add an appointment that conflicts with blocked schedule', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input: {
                    patient: '5f15fa10be9019eb91c1f39b',
                    provider: '5f15fa10be9019eb91c1f39c',
                    startDateTime: '2020-10-12T14:00:00Z',
                    endDateTime: '2020-10-12T15:00:00Z',
                    location: 'Anderson Mill-Austin, TX',
                    room: 'Rm10',
                },
            },
        });
        // expect(res.data.login.token).toEqual('YUBhLmE=');
        console.log(util.inspect(res.data.addAppointment, false, 10, true));
    });

    it('attemps to add an appointment that is within available schedule', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input: {
                    patient: '5f15fa10be9019eb91c1f39b',
                    provider: '5f15fa10be9019eb91c1f39c',
                    startDateTime: '2020-10-19T15:00:00Z',
                    endDateTime: '2020-10-19T16:00:00Z',
                    location: 'Anderson Mill-Austin, TX',
                    room: 'Rm10',
                },
            },
        });
        // expect(res.data.login.token).toEqual('YUBhLmE=');
        console.log(util.inspect(res.data.addAppointment, false, 10, true));
    });

    it('attemps to add an appointment that is not within available schedule, but in regular hours', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input: {
                    patient: '5f15fa10be9019eb91c1f39b',
                    provider: '5f15fa10be9019eb91c1f39c',
                    startDateTime: '2020-11-17T15:00:00Z',
                    endDateTime: '2020-11-17T16:00:00Z',
                    location: 'Anderson Mill-Austin, TX',
                    room: 'Rm10',
                },
            },
        });
        // expect(res.data.login.token).toEqual('YUBhLmE=');
        console.log(util.inspect(res.data.addAppointment, false, 10, true));
    });

    it('attemps to add an appointment that is not within available schedule, but in regular hours, but overlapping', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input: {
                    patient: '5f15fa10be9019eb91c1f39b',
                    provider: '5f15fa10be9019eb91c1f39c',
                    startDateTime: '2020-11-17T15:00:00Z',
                    endDateTime: '2020-11-17T16:00:00Z',
                    location: 'Anderson Mill-Austin, TX',
                    room: 'Rm10',
                },
            },
        });
        // expect(res.data.login.token).toEqual('YUBhLmE=');
        console.log(util.inspect(res.data.addAppointment, false, 10, true));
    });
});
