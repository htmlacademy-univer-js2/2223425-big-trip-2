import dayjs from 'dayjs';

const HOUR_MINUTES_COUNT = 60;
const TOTAL_DAY_MINUTES_COUNT = 1440;
const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'DD/MM/YY hh:mm';
const TIME_FORMAT = 'hh:mm';

const dateFormChange = (date) => dayjs(date).format('DD MMM');

const getDaysOutput = (days) => {
  if (!days) {
    return '';
  }
  if (days < 10) {
    return `0${days}D`;
  }
  return `${days}D`;
};

const getHoursOutput = (days, restHours) => {
  if (!days && !restHours) {
    return '';
  }
  if(restHours < 10) {
    return `0${restHours}H`;
  }
  return `${restHours}H`;
};

const getMinutesOutput = (restMinutes) => (restMinutes < 10) ? `0${restMinutes}M` : `${restMinutes}M`;

const duration = (dateFrom, dateTo) => {
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const difference = end.diff(start, 'minute');

  const days = Math.floor(difference / TOTAL_DAY_MINUTES_COUNT);
  const restHours = Math.floor((difference - days * TOTAL_DAY_MINUTES_COUNT) / HOUR_MINUTES_COUNT);
  const restMinutes = difference - (days * TOTAL_DAY_MINUTES_COUNT + restHours * HOUR_MINUTES_COUNT);

  const daysOutput = getDaysOutput(days);
  const hoursOutput = getHoursOutput(days, restHours);
  const minutesOutput = getMinutesOutput(restMinutes);

  return `${daysOutput} ${hoursOutput} ${minutesOutput}`;
};

const getRandomPositiveInteger = (a = 0, b = 1) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));

  return Math.floor(lower + Math.random() * (upper - lower + 1));
};


const getRandomElement = (elements) => {
  const MIN = 0;
  const max = elements.length - 1;
  return elements[getRandomPositiveInteger(MIN, max)];
};

const updateItem = (items, update) => {
  const index = items.findIndex((item) => item.id === update.id);

  if (index === -1) {
    return items;
  }

  return [
    ...items.slice(0, index),
    update,
    ...items.slice(index + 1),
  ];
};

const getDate = (date) => dayjs(date).format(DATE_FORMAT);

const getTime = (date) => dayjs(date).format(TIME_FORMAT);

const getDateTime = (date) => dayjs(date).format(DATE_TIME_FORMAT);

const isPointDatePast = (date) => dayjs().diff(date, 'day') > 0;

const isPointDateFuture = (date) => date.diff(dayjs(), 'day') >= 0;

const isPointDateFuturePast = (dateFrom, dateTo) => dayjs().diff(dateFrom, 'day') > 0 && dateTo.diff(dayjs(), 'day') > 0;

export {getDaysOutput, updateItem, getHoursOutput, getMinutesOutput, getRandomPositiveInteger, getRandomElement, dateFormChange, duration, getDate, getDateTime, getTime, isPointDateFuture, isPointDatePast, isPointDateFuturePast };


