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
        getPatients: async () => {
            try {
                const patients = await Patient.find({}).exec();
                return {
                    success: true,
                    patients,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        getPatientById: async (_, { id }) => {
            try {
                const patient = await Patient.findById(id).exec();
                return {
                    success: true,
                    patient,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        getProviders: async () => {
            try {
                const providers = await Provider.find({}).exec();
                return {
                    success: true,
                    providers,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        getProviderById: async (_, { id }) => {
            try {
                const provider = await Provider.findById(id).exec();
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
        getAppointmentById: async (_, { id }) => {
            try {
                const appts = await apptFind({ id });

                // Only return the first one
                const appointment = appts.length !== 0 ? appts[0] : null;

                return {
                    success: true,
                    appointmentExtended: appointment,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        getAppointmentsByPeriod: async (_, { startDateTime: periodStart, endDateTime: periodEnd }) => {
            try {
                const appointments = await apptFind({ periodStart, periodEnd });
                return {
                    success: true,
                    appointmentsExtended: appointments,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        getAppointmentsByProvider: async (_, { providerId, startDateTime: periodStart, endDateTime: periodEnd }) => {
            try {
                const appointments = await apptFind({ providerId, periodStart, periodEnd });
                return {
                    success: true,
                    appointmentsExtended: appointments,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        getAppointmentsByPatient: async (_, { patientId, startDateTime: periodStart, endDateTime: periodEnd }) => {
            try {
                const appointments = await apptFind({ patientId, periodStart, periodEnd });
                return {
                    success: true,
                    appointmentsExtended: appointments,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
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
                log.error(err);
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
            try {
                const { success, newRecord, message } = await findOneAndUpdate({ model: Patient, id, input });
                return {
                    success,
                    message,
                    patient: newRecord,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        updateProvider: async (_, { id, input }) => {
            try {
                const { success, newRecord, message } = await findOneAndUpdate({ model: Provider, id, input });
                return {
                    success,
                    message,
                    provider: newRecord,
                };
            } catch (err) {
                log.error(err);
                return {
                    success: false,
                    message: err.message,
                };
            }
        },
        updateAppointment: async (_, { id, input }) => {
            try {
                const appointment = await Appointment.findById(id).exec();

                const adjustedInput = {
                    patient: input.patient || appointment.patient,
                    provider: input.provider || appointment.provider,
                    startDateTime: input.startDateTime || appointment.startDateTime,
                    endDateTime: input.endDateTime || appointment.endDateTime,
                    location: input.location || appointment.location,
                    room: input.room || appointment.room,
                };

                const { success, message } = await checkSuggestedSchedule(adjustedInput);

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
