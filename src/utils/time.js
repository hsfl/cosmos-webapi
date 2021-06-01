const dayjs = require('dayjs');

/**
 * Convert MJD to human readable UTC date
 *
 * @param {Number} mjd MJD to convert
 * @returns {String} UTC date string
 */
function mjdToUTCString(mjd) {
  return dayjs
    .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .utc()
    .format('YYYY-MM-DDTHH:mm:ss');
}

function secondsToMinute(seconds) {
  const second = seconds % 60;
  const minute = Math.floor(seconds / 60);
  return `${minute}:${dayjs().second(second).format('ss')}m`;
}

/**
 * Convert MJD to human readable date
 *
 * @param {Number} mjd MJD to convert
 * @returns {String} UTC date string
 */
function mjdToString(mjd) {
  return dayjs
    .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .format('YYYY-MM-DDTHH:mm:ss');
}

/**
 * Convert a dayjs date to MJD
 *
 * @param {dayjs} date dayjs object
 * @returns {Number} MJD date
 */
function dateToMJD(date) {
  return (date.unix() / 86400.0) + 2440587.5 - 2400000.5;
}

/**
 * Convert MJD to a JavaScript date
 *
 * @param {Number} mjd Number to conver tto JavaScript date
 * @returns {Date} JavaScript date object
 */
function MJDtoJavaScriptDate(mjd) {
  return dayjs
    .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0))
    .toDate();
}

function MJD2daysjs(mjd){
    return dayjs
        .unix((((mjd + 2400000.5) - 2440587.5) * 86400.0));
}

/**
 * Calculate the difference between the current time and the date provided, returning
 * the difference as a dayjs object. If the difference is over a day, then a string is returned.
 *
 * @param {dayjs object} date
 */
function getDiff(date, countdown = false) {
  let futureTime = dayjs();
  let pastTime = date;

  if (countdown) {
    if (date > dayjs()) {
      futureTime = date;
      pastTime = dayjs();
    } else {
      return 'Finished';
    }
  }

  if (typeof date !== 'string' && futureTime.diff(pastTime, 'day') < 1) {
    const hour = futureTime.diff(pastTime, 'hour');
    const minute = futureTime.diff(pastTime, 'minute') % 60;
    const second = futureTime.diff(pastTime, 'second') % 60;

    return dayjs().set('hour', hour).set('minute', minute).set('second', second);
  }

  return 'Over a day';
}

/**
 * returns true if date is within the past 30 days 
 * @param {number} mjd 
 */
function within30Days(mjd) {
  let futureTime = dayjs();
  let pastTime = dayjs.unix((((mjd + 2400000.5) - 2440587.5) * 86400.0));
  if (typeof date !== 'string' && futureTime.diff(pastTime, 'day') < 30) {
      return true; 
  }
  return false; 
}

/**
 * 
 * @returns {Number} current MJD
 */
function currentMJD() {
  return dateToMJD(dayjs());
}

module.exports = {
    dateToMJD,
    within30Days,
    currentMJD,
    MJDtoJavaScriptDate,
    MJD2daysjs,
    mjdToString,
    getDiff
};
