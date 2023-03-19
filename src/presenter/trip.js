import TripList from '../view/trip-list.js';
import Point from '../view/point.js';
import PointEdit from '../view/point-edit.js';
import { render } from '../render.js';
import Sort from '../view/sort.js';

export default class TripEventsPresenter {
  constructor(tripContainer) {
    this.eventsList = new TripList();
    this.tripContainer = tripContainer;
  }

  init(pointsModel) {
    this.pointsModel = pointsModel;
    this.boardPoints = [...this.pointsModel.getPoints()];
    this.destinations = [...this.pointsModel.getDestinations()];
    this.offers = [...this.pointsModel.getOffers()];

    render(new Sort(), this.tripContainer);
    render(this.eventsList, this.tripContainer);
    render(new PointEdit(this.boardPoints[0], this.destinations, this.offers), this.eventsList.getElement());

    for (const point of this.boardPoints){
      render(new Point(point, this.destinations, this.offers), this.eventsList.getElement());
    }
  }
}

