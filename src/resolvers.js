const { Patient, Provider, Appointment } = require('./models');
const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date');
const { GraphQLJSONObject } = require('graphql-type-json');

const { getDayOfWeek } = require('./utils/dates');

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

const isBlocked = async ({ provider, startDateTime, endDateTime }) => {
    const { blockedShifts } = provider;
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    for (const blockedShift of blockedShifts) {
        const { startDate, endDate, shift } = blockedShift;

        // Get unix timestamp for the given dates
        const blockedStartDateTimestamp = moment(startDate).tz(provider.timeZone).valueOf();
        const blockedEndDateTimestamp = moment(endDate).tz(provider.timeZone).valueOf();

        if (blockedStartDateTimestamp < suggestedEndTimestamp || suggestedStartTimestamp < blockedEndDateTimestamp) {
            // the appointment is overlapping with the blocked dates
            if (shift) {
                // Get apointment date string as YYYY-MM-DD
                // Date string can be different depending on time zone
                // For example in Austin time zone (-5:00)
                // '2020-07-19T04:42:32Z' => 2020-07-18
                // '2020-07-19T05:42:32Z' => 2020-07-19
                const appointmentDateStr = moment(startDateTime).tz(provider.timeZone).format().slice(0, 10);
                // (We assume that startDateTime and endDateTime are the same dates but different times)

                const dayOfWeek = getDayOfWeek(new Date(appointmentDateStr).getDay());
                const schedules = shift[dayOfWeek];

                for (const theSchedule of scheduls) {
                    const blockedStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
                        .tz(provider.timeZone)
                        .valueOf();
                    const blockedEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
                        .tz(provider.timeZone)
                        .valueOf();
                    if (
                        blockedStartTimestamp < suggestedEndTimestamp ||
                        suggestedStartTimestamp < blockedEndTimestamp
                    ) {
                        return true;
                    }
                }
            } else {
                // If there is not shift info, then the entire days are off
                return true;
            }
        }
    }
    return false;
};

const passScheduledAvailability = async ({ provider, startDateTime, endDateTime }) => {
    const { scheduledShifts } = provider;
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    for (const scheduledShift of scheduledShifts) {
        const { startDate, endDate, shift } = scheduledShift;

        // Get unix timestamp for the given dates
        const scheduledStartDateTimestamp = moment(startDate).tz(provider.timeZone).valueOf();
        const scheduledEndDateTimestamp = moment(endDate).tz(provider.timeZone).valueOf();

        if (
            suggestedStartTimestamp >= scheduledStartDateTimestamp &&
            suggestedEndTimestamp <= scheduledEndDateTimestamp
        ) {
            // the appointment is overlapping with the blocked dates
            // Get apointment date string as YYYY-MM-DD
            // Date string can be different depending on time zone
            // For example in Austin time zone (-5:00)
            // '2020-07-19T04:42:32Z' => 2020-07-18
            // '2020-07-19T05:42:32Z' => 2020-07-19
            const appointmentDateStr = moment(startDateTime).tz(provider.timeZone).format().slice(0, 10);
            // (We assume that startDateTime and endDateTime are the same dates but different times)

            const dayOfWeek = getDayOfWeek(new Date(appointmentDateStr).getDay());
            const schedules = shift[dayOfWeek];

            for (const theSchedule of scheduls) {
                const scheduledStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
                    .tz(provider.timeZone)
                    .valueOf();
                const scheduledEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
                    .tz(provider.timeZone)
                    .valueOf();
                if (
                    suggestedStartTimestamp >= scheduledStartTimestamp &&
                    suggestedEndTimestamp <= scheduledEndTimestamp
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};

const passRegularHours = async ({ provider, startDateTime, endDateTime }) => {
    const { regularShift } = provider;
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    const { startDate, endDate, shift } = regularShift;

    // the appointment is overlapping with the blocked dates
    // Get apointment date string as YYYY-MM-DD
    // Date string can be different depending on time zone
    // For example in Austin time zone (-5:00)
    // '2020-07-19T04:42:32Z' => 2020-07-18
    // '2020-07-19T05:42:32Z' => 2020-07-19
    const appointmentDateStr = moment(startDateTime).tz(provider.timeZone).format().slice(0, 10);
    // (We assume that startDateTime and endDateTime are the same dates but different times)

    const dayOfWeek = getDayOfWeek(new Date(appointmentDateStr).getDay());
    const schedules = shift[dayOfWeek];

    for (const theSchedule of scheduls) {
        const scheduledStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
            .tz(provider.timeZone)
            .valueOf();
        const scheduledEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
            .tz(provider.timeZone)
            .valueOf();
        if (suggestedStartTimestamp >= scheduledStartTimestamp && suggestedEndTimestamp <= scheduledEndTimestamp) {
            return true;
        }
    }
    return false;
};

const resolvers = {
    Date: GraphQLDate,
    DateTime: GraphQLDateTime,
    JSONObject: GraphQLJSONObject,

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
                // TODO: Check doctor's availability and overlapping
                const { providerId, startDateTimeIso, endDateTimeIso } = args;

                const provider = await Provider.findById(id).exec();
                const startDateTime = new Date(startDateTimeIso);
                const endDateTime = new Date(endDateTimeIso);

                // First check whether the provider's scheduled is blocked during suggested appointment time
                if (isBlocked({ provider, startDateTime, endDateTime })) {
                    return `The suggested appointment is within the provider's blocked schedule`;
                }

                // Check whether the provider's scheduled is open
                // If yes, schedule appointment
                // If no, check regular hours
                if (!passScheduledAvailability({ provider, startDateTime, endDateTime })) {
                    // Check regular hours to see provider's availability
                    if (!passRegularHours({ provider, startDateTime, endDateTime })) {
                        return `The provider is not available during the suggested appointment period`;
                    }
                }

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
