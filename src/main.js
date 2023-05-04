import { render } from './framework/render.js';
import Filter from './view/filter.js';
import TripPresenter from './presenter/trip.js';
import Menu from './view/menu.js';
import PointModel from './model/point-model.js';
import { getPoints, getDestinations, getOffersByType } from './mocks/points.js';
import { generateFilter } from './mocks/filters.js';

const siteHeaderElement = document.querySelector('.trip-main');
const siteMainElement = document.querySelector('.page-main');


const points = getPoints();
const offersByType = getOffersByType();
const destinations = getDestinations();

const pointModel = new PointModel();
pointModel.init(points, destinations, offersByType);
const boardPresenter = new TripPresenter(siteMainElement.querySelector('.trip-events'), pointModel);
boardPresenter.init();

const filters = generateFilter(pointModel.points);

render(new Filter({filters}), siteHeaderElement.querySelector('.trip-controls__filters'));
render(new Menu(), siteHeaderElement.querySelector('.trip-controls__navigation'));
