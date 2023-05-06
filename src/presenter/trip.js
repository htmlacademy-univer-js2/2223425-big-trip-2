import { render, RenderPosition } from '../framework/render.js';
import { SortType } from '../constant.js';
import TripList from '../view/trip-list.js';
import { sortDayPoint, sortPricePoint, sortTimePoint } from '../utils/util.js';
import Sort from '../view/sort.js';
import PointPresenter from './point-presenter.js';
import { updateItem } from '../utils/util.js';
import PointNull from '../view/point-null.js';

export default class TripPresenter {

  #tripContainer = null;
  #pointsModel = null;
  #boardPoints = null;

  #noPointComponent = new PointNull();
  #sortComponent = new Sort();
  #pointListComponent = new TripList();

  #pointPresenter = new Map();
  #currentSortType = null;
  #sourcedBoardPoints = [];

  constructor(tripContainer, pointsModel) {
    this.#tripContainer = tripContainer;
    this.#pointsModel = pointsModel;
  }

  init() {

    this.#boardPoints = [...this.#pointsModel.points];

    this.#sourcedBoardPoints = [...this.#pointsModel.points];

    if (this.#boardPoints.length === 0) {
      this.#renderNoPoints();
    }
    else {
      this.#renderSort();
      this.#renderPointList();
    }
  }

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    this.#boardPoints = updateItem(this.#boardPoints, updatedPoint);
    this.#sourcedBoardPoints = updateItem( this.#sourcedBoardPoints, updatedPoint);
    this.#pointPresenter.get(updatedPoint.id).init(updatedPoint);
  };

  #sortPoint = (sortType) => {
    switch (sortType) {
      case SortType.DAY:
        this.#boardPoints.sort(sortDayPoint);
        break;
      case SortType.TIME:
        this.#boardPoints.sort(sortTimePoint);
        break;
      case SortType.PRICE:
        this.#boardPoints.sort(sortPricePoint);
        break;
    }

    this.#currentSortType = sortType;
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoint(sortType);
    this.#clearPointList();
    this.#renderPointList();
  };

  #renderSort = () => {
    this.#boardPoints.sort(sortDayPoint);
    render(this.#sortComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
  };

  #renderPoint = (point) => {
    const pointPresenter = new PointPresenter(this.#pointListComponent.element, this.#pointsModel, this.#handlePointChange, this.#handleModeChange);
    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  };

  #renderPoints = (from, to) => {
    this.#boardPoints
      .slice(from, to)
      .forEach((point) => this.#renderPoint(point));
  };

  #renderNoPoints = () => {
    render(this.#noPointComponent, this.#tripContainer, RenderPosition.AFTERBEGIN);
  };

  #clearPointList = () => {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  };

  #renderPointList = () => {
    render(this.#pointListComponent, this.#tripContainer);
    this.#renderPoints(0, this.#boardPoints.length);
  };
}
