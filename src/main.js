import Filter from './view/filter.js';
import TripEventsPresenter from './presenter/trip.js';
import { render } from './framework/render.js';
import PointsModel from './model/point-model.js';
import { getPoints, getDestinations, getOffersByType } from './mocks/points';
import { generateFilter } from './mocks/filters.js';

const siteHeaderElement = document.querySelector('.trip-main');
const siteMainElement = document.querySelector('.page-main');
const tripPresenter = new TripEventsPresenter(siteMainElement.querySelector('.trip-events'));

const points = getPoints();
const offersByType = getOffersByType();
const destinations = getDestinations();

const pointsModel = new PointsModel();

const filters = generateFilter(pointsModel.points);

pointsModel.init(points, destinations, offersByType);
tripPresenter.init(pointsModel);

render(new Filter({filters}), siteHeaderElement.querySelector('.trip-controls__filters'));
