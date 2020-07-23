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
const { patientInput, providerInput } = require('./__inputs');

describe('Queries', () => {
    beforeEach(async () => {
        await cleanDb();
    });

    it('fetches list of patients', async () => {
        // create an instance of ApolloServer that mocks out context, while reusing
        // existing dataSources, resolvers, and typeDefs.
        const { server } = constructTestServer();

        const patients = await addPatients(2);

        // use our test server as input to the createTestClient fn
        // This will give us an interface, similar to apolloClient.query
        // to run queries against our instance of ApolloServer
        const { query } = createTestClient(server);
        const res = await query({ query: GET_PATIENTS });

        expect(res.data.getPatients.success).toEqual(true);
        expect(res.data.getPatients.patients[0].id).toEqual(patients[0]._id.toString());
        expect(res.data.getPatients.patients[0].userName).toEqual(patients[0].userName);
        expect(res.data.getPatients.patients[0].firstName).toEqual(patients[0].firstName);
        expect(res.data.getPatients.patients[0].lastName).toEqual(patients[0].lastName);
    });

    it('fetches list of providers', async () => {
        const { server } = constructTestServer();

        const providers = await addProviders(2);

        const { query } = createTestClient(server);
        const res = await query({ query: GET_PROVIDERS });

        expect(res.data.getProviders.success).toEqual(true);
        expect(res.data.getProviders.providers[0].id).toEqual(providers[0]._id.toString());
        expect(res.data.getProviders.providers[0].userName).toEqual(providers[0].userName);
        expect(res.data.getProviders.providers[0].firstName).toEqual(providers[0].firstName);
        expect(res.data.getProviders.providers[0].lastName).toEqual(providers[0].lastName);
    });

    it('fetches list of appointments by period', async () => {
        const { server } = constructTestServer();

        const patients = await addPatients(3);
        const providers = await addProviders(3);

        const numAppts = 2;

        // Just randomly add appointments
        const appointments = await addAppointments(patients, providers, numAppts);
        // console.log(appointments);

        const { query } = createTestClient(server);

        const now = new Date();
        const monthLaterUnixTimestamp = new Date(now).setMonth(now.getMonth() + 1);
        const monthLater = new Date(monthLaterUnixTimestamp);

        const startIsoStr = now.toISOString();
        const endIsoStr = new Date(monthLaterUnixTimestamp).toISOString();
        // console.log(`startIsoStr = ${startIsoStr}`);
        // console.log(`endIsoStr = ${endIsoStr}`);

        const res = await query({
            query: GET_APPOINTMENTS_BY_PERIOD,
            variables: {
                startDateTime: startIsoStr,
                endDateTime: endIsoStr,
            },
        });

        expect(res.data.getAppointmentsByPeriod.success).toBe(true);
        expect(res.data.getAppointmentsByPeriod.appointmentsExtended.length).toBe(numAppts);
        expect(
            new Date(res.data.getAppointmentsByPeriod.appointmentsExtended[0].startDateTime).getTime(),
        ).toBeGreaterThanOrEqual(now.getTime());
        expect(
            new Date(res.data.getAppointmentsByPeriod.appointmentsExtended[0].endDateTime).getTime(),
        ).toBeLessThanOrEqual(monthLater.getTime());
    });
});

describe('Mutations', () => {
    beforeEach(async () => {
        await cleanDb();
    });

    it('adds a patient', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);

        const input = patientInput;

        const res = await mutate({
            mutation: ADD_PATIENT,
            variables: {
                input,
            },
        });

        for (const prop in input) {
            expect(res.data.addPatient.patient[prop]).toEqual(input[prop]);
        }
    });

    it('adds a provider', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);

        const input = providerInput;
        const res = await mutate({
            mutation: ADD_PROVIDER,
            variables: {
                input,
            },
        });

        // Remove id since it will change whenever we test
        delete res.data.addProvider.provider.id;

        expect(res.data.addProvider).toMatchSnapshot();
    });

    it('adds an appointment', async () => {
        const { server } = constructTestServer({
            context: () => {},
        });

        const { mutate } = createTestClient(server);

        const resPatient = await mutate({
            mutation: ADD_PATIENT,
            variables: {
                input: patientInput,
            },
        });

        const patientId = resPatient.data.addPatient.patient.id;

        const resProvider = await mutate({
            mutation: ADD_PROVIDER,
            variables: {
                input: providerInput,
            },
        });

        const providerId = resProvider.data.addProvider.provider.id;

        console.log(`patientId: ${patientId}`);
        console.log(`providerId: ${providerId}`);

        const input = {
            patient: patientId,
            provider: providerId,
            startDateTime: '2020-10-20T15:00:00Z',
            endDateTime: '2020-10-20T16:00:00Z',
            location: 'Anderson Mill-Austin, TX',
            room: 'Rm10',
        };
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input,
            },
        });

        expect(res.data.addAppointment.success).toEqual(true);
        expect(res.data.addAppointment.appointment.patient).toEqual(patientId);
        expect(res.data.addAppointment.appointment.provider).toEqual(providerId);
        expect(new Date(res.data.addAppointment.appointment.startDateTime).getTime()).toEqual(
            new Date(input.startDateTime).getTime(),
        );
        expect(new Date(res.data.addAppointment.appointment.endDateTime).getTime()).toEqual(
            new Date(input.endDateTime).getTime(),
        );
        expect(res.data.addAppointment.appointment.location).toEqual(input.location);
        expect(res.data.addAppointment.appointment.room).toEqual(input.room);
    });
});

describe('Cases for adding an appointment', () => {
    let patient, provider;

    let mutate;

    beforeAll(async () => {
        await cleanDb();

        const { server } = constructTestServer({
            context: () => {},
        });

        ({ mutate } = createTestClient(server));

        const resPatient = await mutate({
            mutation: ADD_PATIENT,
            variables: {
                input: patientInput,
            },
        });

        patient = resPatient.data.addPatient.patient;

        const resProvider = await mutate({
            mutation: ADD_PROVIDER,
            variables: {
                input: providerInput,
            },
        });

        provider = resProvider.data.addProvider.provider;

        console.log(`patient: \n`, patient);
        console.log(`provider: \n`, provider);
    });

    it('attemps to add an appointment that conflicts with blocked schedule', async () => {
        const input = {
            patient: patient.id,
            provider: provider.id,
            startDateTime: '2020-10-12T14:00:00Z',
            endDateTime: '2020-10-12T15:00:00Z',
            location: 'Anderson Mill-Austin, TX',
            room: 'Rm10',
        };

        console.log(input);

        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input,
            },
        });

        expect(res.data.addAppointment.success).toEqual(false);
        expect(res.data.addAppointment.message).toMatch(/blocked schedule/);
    });

    it('attemps to add an appointment that is within available schedule', async () => {
        const input = {
            patient: patient.id,
            provider: provider.id,
            startDateTime: '2020-10-19T15:00:00Z',
            endDateTime: '2020-10-19T16:00:00Z',
            location: 'Anderson Mill-Austin, TX',
            room: 'Rm10',
        };

        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input,
            },
        });

        expect(res.data.addAppointment.success).toEqual(true);
    });

    it('attemps to add an appointment that is not within available schedule, but in regular hours', async () => {
        const input = {
            patient: patient.id,
            provider: provider.id,
            startDateTime: '2020-11-17T15:00:00Z',
            endDateTime: '2020-11-17T16:00:00Z',
            location: 'Anderson Mill-Austin, TX',
            room: 'Rm10',
        };
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input,
            },
        });

        expect(res.data.addAppointment.success).toEqual(true);
    });

    it('attemps to add an appointment that is not within available schedule, but in regular hours, but overlapping', async () => {
        const input = {
            patient: patient.id,
            provider: provider.id,
            startDateTime: '2020-11-17T15:00:00Z',
            endDateTime: '2020-11-17T16:00:00Z',
            location: 'Anderson Mill-Austin, TX',
            room: 'Rm10',
        };
        const res = await mutate({
            mutation: ADD_APPOINTMENT,
            variables: {
                input,
            },
        });

        expect(res.data.addAppointment.success).toEqual(false);
        expect(res.data.addAppointment.message).toMatch(/Overlapped/);
    });
});
