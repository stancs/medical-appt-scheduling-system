const { createTestClient } = require('apollo-server-testing');
const util = require('util');

const { cleanDb, constructTestServer } = require('./__utils');
const {
    GET_PATIENTS,
    GET_PROVIDERS,
    GET_APPOINTMENTS_BY_PERIOD,
    ADD_PATIENT,
    ADD_PROVIDER,
    ADD_APPOINTMENT,
} = require('./__gqls');
const { addPatients, addProviders, addAppointments, getPatients, getProviders } = require('./__db');

describe('Queries', () => {
    beforeEach(async () => {
        await cleanDb();
    });

    it.skip('fetches list of patients', async () => {
        // create an instance of ApolloServer that mocks out context, while reusing
        // existing dataSources, resolvers, and typeDefs.
        const { server } = constructTestServer();

        const patients = await addPatients(2);

        // use our test server as input to the createTestClient fn
        // This will give us an interface, similar to apolloClient.query
        // to run queries against our instance of ApolloServer
        const { query } = createTestClient(server);
        const res = await query({ query: GET_PATIENTS });
        // expect(res).toMatchSnapshot();
        expect(res.data.getPatients[0].id).toEqual(patients[0]._id.toString());
        expect(res.data.getPatients[0].userName).toEqual(patients[0].userName);
        expect(res.data.getPatients[0].firstName).toEqual(patients[0].firstName);
        expect(res.data.getPatients[0].lastName).toEqual(patients[0].lastName);
    });

    it.skip('fetches list of providers', async () => {
        const { server } = constructTestServer();

        const providers = await addProviders(2);

        const { query } = createTestClient(server);
        const res = await query({ query: GET_PROVIDERS });

        expect(res.data.getProviders[0].id).toEqual(providers[0]._id.toString());
        expect(res.data.getProviders[0].userName).toEqual(providers[0].userName);
        expect(res.data.getProviders[0].firstName).toEqual(providers[0].firstName);
        expect(res.data.getProviders[0].lastName).toEqual(providers[0].lastName);
    });

    it('fetches list of appointments by period', async () => {
        const { server } = constructTestServer();

        const patients = await addPatients(3);
        const providers = await addProviders(3);

        const numAppts = 2;

        // Just randomly add appointments
        const appointments = await addAppointments(patients, providers, numAppts);
        console.log(appointments);

        const { query } = createTestClient(server);

        const now = new Date();
        const monthLaterUnixTimestamp = new Date(now).setMonth(now.getMonth() + 1);
        const monthLater = new Date(monthLaterUnixTimestamp);

        const startIsoStr = now.toISOString();
        const endIsoStr = new Date(monthLaterUnixTimestamp).toISOString();
        console.log(`startIsoStr = ${startIsoStr}`);
        console.log(`endIsoStr = ${endIsoStr}`);

        const res = await query({
            query: GET_APPOINTMENTS_BY_PERIOD,
            variables: {
                startDateTime: startIsoStr,
                endDateTime: endIsoStr,
            },
        });

        expect(res.data.getAppointmentsByPeriod.length).toBe(numAppts);
        expect(new Date(res.data.getAppointmentsByPeriod[0].startDateTime).getTime()).toBeGreaterThanOrEqual(
            now.getTime(),
        );
        expect(new Date(res.data.getAppointmentsByPeriod[0].endDateTime).getTime()).toBeLessThanOrEqual(
            monthLater.getTime(),
        );
    });
});

describe.skip('Mutations', () => {
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
