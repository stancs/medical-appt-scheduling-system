const { Patient, Provider, Appointment } = require('./models');
const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date');

const apptFind = async ({ providerId, patientId, periodStart, periodEnd }) => {
    return await Appointment.find({
        ...(providerId && { provider: providerId }),
        ...(patientId && { patient: patientId }),
        $or: [
            { startDateTime: { $gte: periodStart, $lte: periodEnd } },
            { endDateTime: { $gte: periodStart, $lte: periodEnd } },
        ],
    })
        .populate('provider')
        .populate('patient')
        .exec();
};

const resolvers = {
    Date: GraphQLDate,
    DateTime: GraphQLDateTime,
    Query: {
        getPatients: async () => await Patient.find({}).exec(),
        getPatientById: async (_, { id }) => await Patient.findById(id).exec(),
        getProviders: async () => await Provider.find({}).exec(),
        getProviderById: async (_, { id }) => await Provider.findById(id).exec(),
        getAppointmentById: async (_, { id }) => await Appointment.find({ id }).exec(),
        getAppointmentsByPeriod: async (_, { startDateTime: periodStart, endDateTime: periodEnd }) => {
            return await apptFind({ periodStart, periodEnd });
        },
        getAppointmentsByProvider: async (_, { providerId, startDateTime: periodStart, endDateTime: periodEnd }) => {
            return await apptFind({ providerId, periodStart, periodEnd });
        },
        getAppointmentsByPatient: async (_, { patientId, startDateTime: periodStart, endDateTime: periodEnd }) => {
            return await apptFind({ patientId, periodStart, periodEnd });
        },
    },
    Mutation: {
        addPatient: async (_, args) => {
            try {
                const response = await Patient.create(args);
                return response;
            } catch (err) {
                return err.message;
            }
        },
        addProvider: async (_, args) => {
            try {
                const response = await Provider.create(args);
                return response;
            } catch (err) {
                return err.message;
            }
        },
        addAppointment: async (_, args) => {
            try {
                // TODO: Check any overlap
                const response = await Appointment.create(args);
                return response;
            } catch (err) {
                return err.message;
            }
        },

        // addProvider: '',
        // updatePatient: '',
        // updateProvider: '',
        // removePatient: '',
        // removeProvider: '',
        // createSchedule: '',
        // updateSchedule: '',
        // cancelSchedule: '',
    },
};

module.exports = resolvers;
