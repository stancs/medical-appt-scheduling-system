const moment = require('moment-timezone');

const { Provider, Appointment } = require('./models');
const { getDayOfWeek, printTimes } = require('./utils/dates');

const apptFind = async ({ id, providerId, patientId, periodStart, periodEnd }) => {
    return await Appointment.find({
        ...(id && { _id: id }),
        ...(providerId && { provider: providerId }),
        ...(patientId && { patient: patientId }),
        ...(periodStart &&
            periodEnd && {
                $or: [
                    { startDateTime: { $gte: periodStart, $lte: periodEnd } },
                    { endDateTime: { $gte: periodStart, $lte: periodEnd } },
                ],
            }),
    })
        .populate('provider')
        .populate('patient')
        .exec();
};

const deleteOne = async ({ model, id }) => {
    try {
        const response = await model.deleteOne({ _id: id });
        console.log(response);
        return { success: response.ok, deletedCount: response.deletedCount };
    } catch (err) {
        console.log(err);
        return { success: false, message: err.message, deletedCount: 0 };
    }
};

const findOneAndUpdate = async ({ model, id, input }) => {
    console.log(`id=%{id}`);
    console.log(`input=\n`, input);
    try {
        const response = await model.findOneAndUpdate({ _id: id }, input, { new: true });
        console.log(response);
        return {
            success: true,
            newRecord: response,
        };
    } catch (err) {
        console.log(err);
        return {
            success: false,
            message: err.message,
        };
    }
};

const isBlocked = ({ provider, startDateTime, endDateTime }) => {
    const { blockedShifts } = provider;
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    for (const blockedShift of blockedShifts) {
        const { startDate, endDate, shift } = blockedShift;

        // Get unix timestamp for the given dates
        const blockedStartDateTimestamp = moment(startDate).tz(provider.timeZone).valueOf();
        const blockedEndDateTimestamp = moment(endDate).tz(provider.timeZone).valueOf();

        console.log(`suggested start    : ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
        console.log(`suggested end      : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
        console.log(`blocked date start : ${printTimes(blockedStartDateTimestamp, provider.timeZone)}`);
        console.log(`blocked date end   : ${printTimes(blockedEndDateTimestamp, provider.timeZone)}`);

        const isOverlapped = !(
            (suggestedStartTimestamp < blockedStartDateTimestamp &&
                suggestedEndTimestamp < blockedStartDateTimestamp) ||
            (blockedEndDateTimestamp < suggestedStartTimestamp && blockedEndDateTimestamp < suggestedEndTimestamp)
        );

        console.log(`isOverlapped = ${isOverlapped}`);

        if (isOverlapped) {
            // the appointment is overlapping with the blocked dates
            if (shift) {
                // Get apointment date string as YYYY-MM-DD
                // Date string can be different depending on time zone
                // For example in Austin time zone (-5:00)
                // '2020-07-19T04:42:32Z' => 2020-07-18
                // '2020-07-19T05:42:32Z' => 2020-07-19
                const appointmentDateStr = moment(startDateTime).tz(provider.timeZone).format().slice(0, 10);
                // (We assume that startDateTime and endDateTime are the same dates but different times)

                const idx = new Date(moment(startDateTime).tz(provider.timeZone).format()).getDay();
                const dayOfWeek = getDayOfWeek(idx);
                const schedules = shift[dayOfWeek];

                for (const theSchedule of scheduls) {
                    const blockedStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
                        .tz(provider.timeZone)
                        .valueOf();
                    const blockedEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
                        .tz(provider.timeZone)
                        .valueOf();

                    console.log(`suggested start : ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
                    console.log(`suggested end   : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
                    console.log(`blocked start   : ${printTimes(blockedStartTimestamp, provider.timeZone)}`);
                    console.log(`blocked end     : ${printTimes(blockedEndTimestamp, provider.timeZone)}`);

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
    console.log('return false');
    return false;
};

const isAvailable = ({ provider, startDateTime, endDateTime }) => {
    const { scheduledShifts, regularShift } = provider;
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    let isEverContained = false;
    debugger;
    for (const scheduledShift of scheduledShifts) {
        const { startDate, endDate, shift } = scheduledShift;

        // Get unix timestamp for the given dates
        const scheduledStartDateTimestamp = moment(startDate).tz(provider.timeZone).valueOf();
        const scheduledEndDateTimestamp = moment(endDate).tz(provider.timeZone).valueOf();

        console.log(`suggested start     : ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
        console.log(`suggested end       : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
        console.log(`scheduled date start: ${printTimes(scheduledStartDateTimestamp, provider.timeZone)}`);
        console.log(`scheduled date end  : ${printTimes(scheduledEndDateTimestamp, provider.timeZone)}`);

        const isContained =
            scheduledStartDateTimestamp <= suggestedStartTimestamp &&
            suggestedEndTimestamp <= scheduledEndDateTimestamp;

        if (isContained) {
            isEverContained = true;
            // the appointment is overlapping with the blocked dates
            // Get apointment date string as YYYY-MM-DD
            // Date string can be different depending on time zone
            // For example in Austin time zone (-5:00)
            // '2020-07-19T04:42:32Z' => 2020-07-18
            // '2020-07-19T05:42:32Z' => 2020-07-19
            const appointmentDateStr = moment(startDateTime).tz(provider.timeZone).format().slice(0, 10);
            // (We assume that startDateTime and endDateTime are the same dates but different times)

            const idx = new Date(moment(startDateTime).tz(provider.timeZone).format()).getDay();
            const dayOfWeek = getDayOfWeek(idx);
            const schedules = shift[dayOfWeek];
            if (schedules) {
                for (const theSchedule of schedules) {
                    const scheduledStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
                        .tz(provider.timeZone)
                        .valueOf();
                    const scheduledEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
                        .tz(provider.timeZone)
                        .valueOf();

                    console.log(`suggested start: ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
                    console.log(`suggested end  : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
                    console.log(`scheduled start: ${printTimes(scheduledStartTimestamp, provider.timeZone)}`);
                    console.log(`scheduled end  : ${printTimes(scheduledEndTimestamp, provider.timeZone)}`);

                    if (
                        scheduledStartTimestamp <= suggestedStartTimestamp &&
                        suggestedEndTimestamp <= scheduledEndTimestamp
                    ) {
                        return true;
                    }
                }
            } else {
                return false;
            }
        }
    }

    if (!isEverContained) {
        console.log('trace isEverContained');
        // the appointment is overlapping with the blocked dates
        // Get apointment date string as YYYY-MM-DD
        // Date string can be different depending on time zone
        // For example in Austin time zone (-5:00)
        // '2020-07-19T04:42:32Z' => 2020-07-18
        // '2020-07-19T05:42:32Z' => 2020-07-19
        const appointmentDateStr = moment(startDateTime).tz(provider.timeZone).format().slice(0, 10);
        // (We assume that startDateTime and endDateTime are the same dates but different times)
        console.log(`appointmentDateStr = ${appointmentDateStr}`);

        const idx = new Date(moment(startDateTime).tz(provider.timeZone).format()).getDay();
        const dayOfWeek = getDayOfWeek(idx);
        console.log(`dayOfWeek = ${dayOfWeek}`);

        const schedules = regularShift[dayOfWeek];

        if (schedules) {
            for (const theSchedule of schedules) {
                const scheduledStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
                    .tz(provider.timeZone)
                    .valueOf();
                const scheduledEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
                    .tz(provider.timeZone)
                    .valueOf();

                console.log(`suggested start: ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
                console.log(`suggested end  : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
                console.log(`regular   start: ${printTimes(scheduledStartTimestamp, provider.timeZone)}`);
                console.log(`regular   end  : ${printTimes(scheduledEndTimestamp, provider.timeZone)}`);

                if (
                    scheduledStartTimestamp <= suggestedStartTimestamp &&
                    suggestedEndTimestamp <= scheduledEndTimestamp
                ) {
                    return true;
                }
            }
        } else {
            return false;
        }
    }

    return false;
};

const isOverlapped = async ({ provider, startDateTime, endDateTime }) => {
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    const now = new Date();
    const farFuture = new Date();
    farFuture.setYear(now.getFullYear() + 100);

    const appointments = await apptFind({ providerId: provider._id, periodStart: now, periodEnd: farFuture });

    for (const appt of appointments) {
        const apptStartTimestamp = appt.startDateTime.getTime();
        const apptEndTimestamp = appt.endDateTime.getTime();

        console.log(`suggested start: ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
        console.log(`suggested end  : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
        console.log(`appt start     : ${printTimes(apptStartTimestamp, provider.timeZone)}`);
        console.log(`appt end       : ${printTimes(apptEndTimestamp, provider.timeZone)}`);

        const isOverlappedWithAppt = !(
            (suggestedStartTimestamp < apptStartTimestamp && suggestedEndTimestamp < apptStartTimestamp) ||
            (apptEndTimestamp < suggestedStartTimestamp && apptEndTimestamp < suggestedEndTimestamp)
        );

        if (isOverlappedWithAppt) {
            return true;
        }
    }
    return false;
};

const checkSuggestedSchedule = async input => {
    const { provider: providerId, startDateTime: startDateTimeIso, endDateTime: endDateTimeIso } = input;
    console.log(`providerId = ${providerId}`);

    const provider = await Provider.findById(providerId).exec();
    const startDateTime = new Date(startDateTimeIso);
    const endDateTime = new Date(endDateTimeIso);

    console.log(`provider = ${provider}`);
    console.log(`startDateTime = ${startDateTime}`);
    console.log(`endDateTime = ${endDateTime}`);

    if (!provider) {
        const errMsg = 'Searching a provider using the given ID failed';
        console.error(errMsg);
        return {
            success: false,
            message: errMsg,
        };
    }

    // First check whether the provider's scheduled is blocked during suggested appointment time
    if (isBlocked({ provider, startDateTime, endDateTime })) {
        const errMsg = `The suggested appointment conflicts with the provider's blocked schedule`;
        console.error(errMsg);
        return {
            success: false,
            message: errMsg,
        };
    }

    // Check whether the provider's scheduled is open
    if (!isAvailable({ provider, startDateTime, endDateTime })) {
        const errMsg = `The provider is not available during the suggested appointment period`;
        console.log(errMsg);
        return {
            success: false,
            message: errMsg,
        };
    }

    const isOverlappedWithAnother = await isOverlapped({ provider, startDateTime, endDateTime });
    if (isOverlappedWithAnother) {
        const errMsg = `Overlapped appointment`;
        console.log(errMsg);
        return {
            success: false,
            message: errMsg,
        };
    }

    return {
        success: true,
    };
};

module.exports = {
    apptFind,
    checkSuggestedSchedule,
    deleteOne,
    findOneAndUpdate,
};
