import dayjs from 'dayjs';

const MAX_MINUTES = 60;
const MAX_HOURS = 24;

const humanizeEventTime = (dateTime, format) => dayjs(dateTime).format(format).toUpperCase();

const transformTimeDifference = (difference) => {
  let format = 'DD[D] HH[H] mm[M]';
  if(difference < MAX_MINUTES){
    format = 'mm[M]';
  }
  else if (difference / MAX_MINUTES < MAX_HOURS) {
    format = 'HH[H] mm[M]';
  }
  return humanizeEventTime(dayjs().date(difference / (MAX_MINUTES * MAX_HOURS)).hour((difference / MAX_MINUTES) % MAX_HOURS).minute(difference % MAX_MINUTES), format);
};

const getTimeDifference = (dateFrom, dateTo) => transformTimeDifference(dayjs(dateTo).diff(dayjs(dateFrom), 'minute'));

const isPast = (date, unit) => dayjs().isAfter(dayjs(date), unit);

const isFuture = (date, unit) => dayjs().isBefore(dayjs(date), unit) || dayjs().isSame(dayjs(date), unit);


const sortByDate = (currentPoint, nextPoint) => {
  const dateFromDifference = dayjs(currentPoint.dateFrom).diff(dayjs(nextPoint.dateFrom));
  return dateFromDifference === 0 ? dayjs(nextPoint.dateTo).diff(dayjs(currentPoint.dateTo)) : dateFromDifference;
};

const sortByDuration = (currentPoint, nextPoint) => dayjs(nextPoint.dateTo).diff(dayjs(nextPoint.dateFrom)) - dayjs(currentPoint.dateTo).diff(dayjs(currentPoint.dateFrom));
const areDatesSame = (oldDate, newDate) => dayjs(oldDate).isSame(dayjs(newDate));

export {humanizeEventTime, getTimeDifference, isPast, isFuture, sortByDate, sortByDuration, areDatesSame};
