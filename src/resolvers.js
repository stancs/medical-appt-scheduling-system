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

const deleteOne = async ({ model, id }) => {
    try {
        const response = await model.deleteOne({ _id: id });
        console.log(response);
        return { isSuccess: response.ok, deleteCount: response.deletedCount };
    } catch (err) {
        console.log(err);
        return err.message;
    }
};

const findOneAndUpdate = async ({ model, id, update }) => {
    console.log(`id=%{id}`);
    console.log(`update=\n`, update);
    try {
        const response = await model.findOneAndUpdate({ _id: id }, update, { new: true });
        console.log(response);
        return response;
    } catch (err) {
        console.log(err);
        return err.message;
    }
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
        updateAppointment: async () => {},
        updatePatient: async (_, args) => {
            const { id, ...update } = args;
            return findOneAndUpdate({ model: Patient, id, update });
        },
        updateProvider: async (_, args) => {
            const { id, ...update } = args;
            return findOneAndUpdate({ model: Provider, id, update });
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
