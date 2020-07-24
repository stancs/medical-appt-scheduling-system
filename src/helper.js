const moment = require('moment-timezone');

const { Provider, Appointment } = require('./models');
const { log } = require('./logger');
const { getDayOfWeek, printTimes } = require('./utils/dates');

/**
 * Find appointment records by Appointment ID, Provider ID, Patient ID, and period.
 * This call will populate associated provider and patient data and attach them
 * @param {string} Object.id            Appointment doc Object ID string
 * @param {string} Object.providerId    Provider ID
 * @param {string} Object.patientId     Patient ID
 * @param {object} Object.periodStart   Starting point of the given period
 * @param {object} Object.periodEnd     Ending point of the given period
 */
const apptFind = async ({ id, providerId, patientId, periodStart, periodEnd }) => {
    log.debug(`id = ${id}`);
    log.debug(`providerId = ${providerId}`);
    log.debug(`patientId  = ${patientId}`);
    log.debug(`periodStart = ${periodStart}`);
    log.debug(`periodEnd   = ${periodEnd}`);

    const appointments = await Appointment.find({
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

    log.debug(`appointments = \n`, appointments);
    return appointments;
};

/**
 * Delete a record with the given ID from the specified model
 * @param {object} Object.model     Model
 * @param {string} Object.id        Document's Object ID string
 */
const deleteOne = async ({ model, id }) => {
    try {
        const response = await model.deleteOne({ _id: id });
        log.debug(response);
        return { success: response.ok, deletedCount: response.deletedCount };
    } catch (err) {
        log.error(err);
        return { success: false, message: err.message, deletedCount: 0 };
    }
};

/**
 * Update a record with the given ID from the specified model
 * @param {object} Object.model     Model
 * @param {string} Object.id        Document's Object ID string
 * @param {object} Object.input     Input props that needs to be updated
 */
const findOneAndUpdate = async ({ model, id, input }) => {
    try {
        const response = await model.findOneAndUpdate({ _id: id }, input, { new: true });
        log.debug(response);
        return {
            success: true,
            newRecord: response,
        };
    } catch (err) {
        log.error(err);
        return {
            success: false,
            message: err.message,
        };
    }
};

/**
 * Check the suggested schedule is included in any of the blocked schedules of the provider
 * @param {object} Object.provider          Provider
 * @param {object} Object.startDateTime     Suggested schedule start time
 * @param {object} Object.endDateTime       Suggested schedule end time
 */
const isBlocked = ({ provider, startDateTime, endDateTime }) => {
    const { blockedShifts } = provider;
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    for (const blockedShift of blockedShifts) {
        const { startDate, endDate, shift } = blockedShift;

        // Get unix timestamp for the given dates
        const blockedStartDateTimestamp = moment(startDate).tz(provider.timeZone).valueOf();
        const blockedEndDateTimestamp = moment(endDate).tz(provider.timeZone).valueOf();

        log.debug(`suggested start    : ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
        log.debug(`suggested end      : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
        log.debug(`blocked date start : ${printTimes(blockedStartDateTimestamp, provider.timeZone)}`);
        log.debug(`blocked date end   : ${printTimes(blockedEndDateTimestamp, provider.timeZone)}`);

        // First check whether the suggested schedule is within the blocked dates
        const isOverlapped = !(
            (suggestedStartTimestamp < blockedStartDateTimestamp &&
                suggestedEndTimestamp < blockedStartDateTimestamp) ||
            (blockedEndDateTimestamp < suggestedStartTimestamp && blockedEndDateTimestamp < suggestedEndTimestamp)
        );

        log.debug(`isOverlapped = ${isOverlapped}`);

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

                // Now check with the actual blocked schedules
                for (const theSchedule of scheduls) {
                    const blockedStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
                        .tz(provider.timeZone)
                        .valueOf();
                    const blockedEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
                        .tz(provider.timeZone)
                        .valueOf();

                    log.debug(`suggested start : ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
                    log.debug(`suggested end   : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
                    log.debug(`blocked start   : ${printTimes(blockedStartTimestamp, provider.timeZone)}`);
                    log.debug(`blocked end     : ${printTimes(blockedEndTimestamp, provider.timeZone)}`);

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

/**
 * Check the suggested schedule from a patient in the available spots of the provider.
 * We will check the provider's scheduled shifts first, then regular hours
 * @param {object} Object.provider          Provider
 * @param {object} Object.startDateTime     Suggested schedule start time
 * @param {object} Object.endDateTime       Suggested schedule end time
 */
const isAvailable = ({ provider, startDateTime, endDateTime }) => {
    const { scheduledShifts, regularShift } = provider;
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    // Put this value to check whether the suggested schedule is within any of the scheduled shift dates
    let isEverContained = false;
    debugger;
    for (const scheduledShift of scheduledShifts) {
        const { startDate, endDate, shift } = scheduledShift;

        // Get unix timestamp for the given dates
        const scheduledStartDateTimestamp = moment(startDate).tz(provider.timeZone).valueOf();
        const scheduledEndDateTimestamp = moment(endDate).tz(provider.timeZone).valueOf();

        log.debug(`suggested start     : ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
        log.debug(`suggested end       : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
        log.debug(`scheduled date start: ${printTimes(scheduledStartDateTimestamp, provider.timeZone)}`);
        log.debug(`scheduled date end  : ${printTimes(scheduledEndDateTimestamp, provider.timeZone)}`);

        // First check whether the suggested schedule is within the scheduled shift dates
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

                    log.debug(`suggested start: ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
                    log.debug(`suggested end  : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
                    log.debug(`scheduled start: ${printTimes(scheduledStartTimestamp, provider.timeZone)}`);
                    log.debug(`scheduled end  : ${printTimes(scheduledEndTimestamp, provider.timeZone)}`);

                    if (
                        scheduledStartTimestamp <= suggestedStartTimestamp &&
                        suggestedEndTimestamp <= scheduledEndTimestamp
                    ) {
                        log.debug('true: suggested time is within the available schedule');
                        return true;
                    }
                }
            } else {
                log.debug('false: suggested time within the available dates but out of the available hours');
                return false;
            }
        }
    }

    // If the suggested schedule does not belong to any of the available shifts, then we check the regular hours of the provider
    if (!isEverContained) {
        log.trace('========== (isEverContained === false) ==========');
        // the appointment is overlapping with the blocked dates
        // Get apointment date string as YYYY-MM-DD
        // Date string can be different depending on time zone
        // For example in Austin time zone (-5:00)
        // '2020-07-19T04:42:32Z' => 2020-07-18
        // '2020-07-19T05:42:32Z' => 2020-07-19
        const appointmentDateStr = moment(startDateTime).tz(provider.timeZone).format().slice(0, 10);
        // (We assume that startDateTime and endDateTime are the same dates but different times)
        log.debug(`appointmentDateStr = ${appointmentDateStr}`);

        const idx = new Date(moment(startDateTime).tz(provider.timeZone).format()).getDay();
        const dayOfWeek = getDayOfWeek(idx);
        log.debug(`dayOfWeek = ${dayOfWeek}`);

        const schedules = regularShift[dayOfWeek];

        if (schedules) {
            for (const theSchedule of schedules) {
                const scheduledStartTimestamp = moment(`${appointmentDateStr}T${theSchedule.start}`)
                    .tz(provider.timeZone)
                    .valueOf();
                const scheduledEndTimestamp = moment(`${appointmentDateStr}T${theSchedule.end}`)
                    .tz(provider.timeZone)
                    .valueOf();

                log.debug(`suggested start: ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
                log.debug(`suggested end  : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
                log.debug(`regular   start: ${printTimes(scheduledStartTimestamp, provider.timeZone)}`);
                log.debug(`regular   end  : ${printTimes(scheduledEndTimestamp, provider.timeZone)}`);

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

/**
 * Check the suggested schedule from a patient overlaps with any of existing schedules of the provider
 * @param {object} Object.provider          Provider
 * @param {object} Object.startDateTime     Suggested schedule start time
 * @param {object} Object.endDateTime       Suggested schedule end time
 */
const isOverlapped = async ({ patientId, provider, startDateTime, endDateTime }) => {
    log.trace('========== isOverlapped ==========');
    const suggestedStartTimestamp = startDateTime.getTime();
    const suggestedEndTimestamp = endDateTime.getTime();

    const now = new Date();
    const farFuture = new Date(new Date(now).setYear(now.getFullYear() + 100));
    log.debug(`now       = ${now.toISOString()}`);
    log.debug(`farFuture = ${farFuture.toISOString()}`);

    // Find existing appointments of the provider from now to future day(100 year later)
    const appointments = await apptFind({
        patientId,
        providerId: provider._id,
        periodStart: now.toISOString(),
        periodEnd: farFuture.toISOString(),
    });
    log.debug(`appointments = \n`, appointments);

    for (const appt of appointments) {
        const apptStartTimestamp = appt.startDateTime.getTime();
        const apptEndTimestamp = appt.endDateTime.getTime();

        log.debug(`suggested start: ${printTimes(suggestedStartTimestamp, provider.timeZone)}`);
        log.debug(`suggested end  : ${printTimes(suggestedEndTimestamp, provider.timeZone)}`);
        log.debug(`appt start     : ${printTimes(apptStartTimestamp, provider.timeZone)}`);
        log.debug(`appt end       : ${printTimes(apptEndTimestamp, provider.timeZone)}`);

        const isOverlappedWithAppt = !(
            (suggestedStartTimestamp <= apptStartTimestamp && suggestedEndTimestamp <= apptStartTimestamp) ||
            (apptEndTimestamp <= suggestedStartTimestamp && apptEndTimestamp <= suggestedEndTimestamp)
        );

        if (isOverlappedWithAppt) {
            log.debug('true: the suggested schedule is overlapped with the existing schedules');
            return true;
        }
    }
    log.debug('false: the suggested schedule is NOT overlapped with the existing schedules');
    return false;
};

/**
 * Check the suggested schedule by checking the provider's blocked shifts, available shifts, regular hours, and existing appointments
 * @param {object} input Input parameters
 */
const checkSuggestedSchedule = async input => {
    const { patient: patientId, provider: providerId, startDateTime, endDateTime } = input;
    log.debug(`patientId = ${patientId}`);
    log.debug(`providerId = ${providerId}`);

    const provider = await Provider.findById(providerId).exec();

    log.debug(`provider = \n`, provider);
    log.debug(`startDateTime = ${startDateTime}`);
    log.debug(`endDateTime = ${endDateTime}`);

    if (!provider) {
        const errMsg = 'Searching a provider using the given ID failed';
        log.error(errMsg);
        return {
            success: false,
            message: errMsg,
        };
    }

    // First check whether the provider's scheduled is blocked during suggested appointment time
    if (isBlocked({ provider, startDateTime, endDateTime })) {
        const errMsg = `The suggested appointment conflicts with the provider's blocked schedule`;
        log.error(errMsg);
        return {
            success: false,
            message: errMsg,
        };
    }

    // Check whether the provider's scheduled is open
    if (!isAvailable({ provider, startDateTime, endDateTime })) {
        const errMsg = `The provider is not available during the suggested appointment period`;
        log.error(errMsg);
        return {
            success: false,
            message: errMsg,
        };
    }
    try {
        // Check whether the provider's schedule is overlapping with the suggested schedule
        const isOverlappedWithAnother = await isOverlapped({
            patientId,
            provider,
            startDateTime,
            endDateTime,
        });
        if (isOverlappedWithAnother) {
            const errMsg = `Overlapped appointment`;
            log.error(errMsg);
            return {
                success: false,
                message: errMsg,
            };
        }

        log.debug('Finally the suggested schedule passed all the tests');
        return {
            success: true,
        };
    } catch (err) {
        log.error(err);
        return {
            success: false,
            message: err.message,
        };
    }
};

module.exports = {
    apptFind,
    checkSuggestedSchedule,
    deleteOne,
    findOneAndUpdate,
};
