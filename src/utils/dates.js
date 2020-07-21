const moment = require('moment-timezone');

// Hash table to convert day index to actual day string
// ex) new Date().getDay() will return an index (0-6)
const dayOfWeekHash = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
};

/**
 * Get the day of the week string from a given day index
 * ex) If the given index is 0, then we return 'Sunday'
 * @param {number} num Day index
 */
const getDayOfWeek = num => {
    return dayOfWeekHash[num];
};

/**
 * Returns a string as HH:MM format.
 * Some one digit numbers such as 1 will be padded with '0' and will return as '01'
 * @param {number} hr24     Hour(24hr-based)
 * @param {number} min      Minutes
 */
const getHHMM = (hr24, min) => {
    const paddedHr24 = hr24.toString().padStart(2, '0');
    const paddedMin = min.toString().padStart(2, '0');
    return `${paddedHr24}:${paddedMin}`;
};

/**
 * Convert a given Unix timestamp in milliseconds into ISO time and local time as well as the given unix timpstamp
 * ex) '2020-12-08T15:00:00.000Z = 2020-12-08T09:00:00-06:00 = 1607439600000'
 * @param {number} timestamp    Unix timestamp in milliseconds
 * @param {string} timeZone     Time zone information ex) 'America/Chicago'
 */
const printTimes = (timestamp, timeZone) => {
    const isoTime = new Date(timestamp).toISOString();
    const localTime = moment(timestamp).tz(timeZone).format();
    return `${isoTime} = ${localTime} = ${timestamp}`;
};

module.exports = {
    getDayOfWeek,
    getHHMM,
    printTimes,
};
