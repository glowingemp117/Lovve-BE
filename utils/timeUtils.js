const { DateTime } = require('luxon');

// (November 05, 1998) convert this format
const convertToMonthDayYear = ({ isoString }) => {
    return DateTime.fromISO(isoString).toFormat('MMMM dd, yyyy');
};

const convertToGMT = ({ isoString }) => {
    return DateTime.fromISO(isoString).toJSDate();
};

const convertTimeToFloat = ({ isoString }) => {
    let dh = new Date(isoString).getHours();
    let dm = new Date(isoString).getMinutes();
    let floatedTime = dm / 60 + dh;
    return floatedTime;
};

const convertFloatToTime = ({ isoString, date }) => {
    let number = isoString;
    let sign = number >= 0 ? 1 : -1;
    number = number * sign;
    let hour = Math.floor(number);
    let decpart = number - hour;
    let min = 1 / 60;
    decpart = min * Math.round(decpart / min);
    let minute = Math.floor(decpart * 60) + '';
    if (minute.length < 2) {
        minute = '0' + minute;
    }
    sign = sign == 1 ? '' : '-';
    let time = sign + hour + ':' + minute;
    return new Date(`${date} ${time}`);
};

module.exports = {
    convertFloatToTime,
    convertTimeToFloat,
    convertToGMT,
    convertToMonthDayYear
};
