const moment = require('moment-timezone');

const dayOfWeekHash = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
};

const getDayOfWeek = num => {
    return dayOfWeekHash[num];
};

const tz = (dateStr, timeZone) => {
    return moment.tz(dateStr, timeZone);
};

const getHHMM = (hr24, min) => {
    const paddedHr24 = hr24.toString().padStart(2, '0');
    const paddedMin = min.toString().padStart(2, '0');
    return `${paddedHr24}:${paddedMin}`;
};

module.exports = {
    getDayOfWeek,
    getHHMM,
    tz,
};
