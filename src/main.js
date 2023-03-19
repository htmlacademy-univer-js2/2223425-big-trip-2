import Filter from './view/filter.js';
import TripEventsPresenter from './presenter/trip.js';
import { render } from './render.js';
import PointsModel from './model/point-model.js';
import { getPoints, getDestinations, getOffersByType } from './mocks/points';

const siteHeaderElement = document.querySelector('.trip-main');
const siteMainElement = document.querySelector('.page-main');
const tripPresenter = new TripEventsPresenter(siteMainElement.querySelector('.trip-events'));

const points = getPoints();
const offersByType = getOffersByType();
const destinations = getDestinations();

const pointsModel = new PointsModel();

render(new Filter(), siteHeaderElement.querySelector('.trip-controls__filters'));

pointsModel.init(points, destinations, offersByType);
tripPresenter.init(pointsModel);
