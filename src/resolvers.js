const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date');
const { GraphQLJSON } = require('graphql-type-json');

const { Patient, Provider, Appointment } = require('./models');
const { apptFind, checkSuggestedSchedule, deleteOne, findOneAndUpdate } = require('./helper');
const { log } = require('./logger');

const resolvers = {
    Date: GraphQLDate,
    DateTime: GraphQLDateTime,
    JSON: GraphQLJSON,

    Query: {
        getPatients: async () => await Patient.find({}).exec(),
        getPatientById: async (_, { id }) => await Patient.findById(id).exec(),
        getProviders: async () => await Provider.find({}).exec(),
        getProviderById: async (_, { id }) => await Provider.findById(id).exec(),
        getAppointmentById: async (_, { id }) => {
            const appts = await apptFind({ id });

            // Only return the first one
            if (appts.length !== 0) {
                return appts[0];
            } else {
                return null;
            }
        },
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
        addPatient: async (_, { input }) => {
            try {
                const patient = await Patient.create(input);

                return {
                    success: true,
                    patient,
                };
            } catch (err) {
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        addProvider: async (_, { input }) => {
            try {
                const provider = await Provider.create(input);
                return {
                    success: true,
                    provider,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        addAppointment: async (_, { input }) => {
            try {
                const { success, message } = await checkSuggestedSchedule(input);
                console.log(`Check suggested schedule: success=${success}, message=${message}`);
                let appointment;
                if (success) {
                    appointment = await Appointment.create(input);
                }
                log.debug(`appointment = \n`, appointment);
                return {
                    success,
                    message,
                    appointment,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        updatePatient: async (_, { id, input }) => {
            const { success, newRecord, message } = await findOneAndUpdate({ model: Patient, id, input });
            return {
                success,
                message,
                patient: newRecord,
            };
        },
        updateProvider: async (_, { id, input }) => {
            const { success, newRecord, message } = await findOneAndUpdate({ model: Provider, id, input });
            return {
                success,
                message,
                provider: newRecord,
            };
        },
        updateAppointment: async (_, { id, input }) => {
            try {
                const { success, message } = await checkSuggestedSchedule(input);
                if (success) {
                    const { success: updateSuccess, newRecord, message: updateMsg } = await findOneAndUpdate({
                        model: Appointment,
                        id,
                        input,
                    });
                    return {
                        success: updateSuccess,
                        message: updateMsg,
                        appointment: newRecord,
                    };
                } else {
                    return {
                        success,
                        message,
                    };
                }
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        removePatient: async (_, { id }) => {
            return deleteOne({ model: Patient, id });
        },
        removeProvider: async (_, { id }) => {
            return deleteOne({ model: Provider, id });
        },
        cancelAppointment: async (_, { id }) => {
            return deleteOne({ model: Appointment, id });
        },
    },
};

module.exports = resolvers;
