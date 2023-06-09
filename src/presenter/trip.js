import PointList from '../view/point-list';
import Sort from '../view/sort';
import Loading from '../view/loading';
import PointEmpty from '../view/point-empty';
import { render, remove} from '../framework/render';
import { filter } from '../utils/filter-util';
import PointPresenter from './point-presenter';
import PointNew from './point-new';
import { sortPointsByType } from '../utils/sort-util';
import { UserAction, UpdateType, FilterTypes, SortType } from '../constant';
import UiBlocker from '../framework/ui-blocker/ui-blocker';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class Trip{
  #pointsModel;
  #offersByTypeModel;
  #destinationModel;
  #filterModel;

  #pointsComponent;
  #pointsList;
  #noPointsMessage = null;

  #pointPresenter;
  #pointNewPresenter;

  #sortComponent;
  #currentSortType = SortType.DAY;

  #loadingComponent = new Loading();
  #isLoading = true;
  #uiBlocker = new UiBlocker(TimeLimit.LOWER_LIMIT, TimeLimit.UPPER_LIMIT);

  constructor(pointsComponent, pointsModel, offersByTypeModel, destinationModel, filterModel) {
    this.#pointsModel = pointsModel;
    this.#offersByTypeModel = offersByTypeModel;
    this.#destinationModel = destinationModel;
    this.#filterModel = filterModel;

    this.#pointsComponent = pointsComponent;
    this.#pointsList = new PointList();

    this.#pointPresenter = new Map();
    this.#pointNewPresenter = new PointNew(this.#pointsList.element, this.#offersByTypeModel.offersByType,
      this.#destinationModel.destinations, this.#handleViewAction);

    this.#sortComponent = null;
    this.#currentSortType = SortType.DAY;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#offersByTypeModel.addObserver(this.#handleModelEvent);
    this.#destinationModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filteredPoints = filter[this.#filterModel.filterType]([...this.#pointsModel.points]);
    return sortPointsByType[this.#currentSortType](filteredPoints);
  }

  init() {
    this.#renderBoard();
  }

  createPoint(destroyCallback) {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilterType(UpdateType.MAJOR, FilterTypes.EVERYTHING);
    this.#pointNewPresenter.init(destroyCallback);
  }

  #renderBoard() {
    if(this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if(!this.points.length){
      this.#renderNoPointsMessage();
      return;
    }

    this.#renderSort();
    this.#renderPointsList();
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#pointsComponent);
  }

  #renderNoPointsMessage() {
    this.#noPointsMessage = new PointEmpty(this.#filterModel.filterType);
    render(this.#noPointsMessage, this.#pointsComponent);
  }

  #renderSort() {
    this.#sortComponent = new Sort(this.#currentSortType);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    render(this.#sortComponent, this.#pointsComponent);
  }

  #renderPoints() {
    this.points.forEach((point) => this.#renderPoint(point));
  }

  #renderPointsList() {
    render(this.#pointsList, this.#pointsComponent);
    this.#renderPoints();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter(this.#pointsList.element, this.#offersByTypeModel.offersByType,this.#destinationModel.destinations ,this.#handleViewAction, this.#onPointModeChange);
    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #clearBoard(sortType) {
    this.#pointNewPresenter.destroy();

    this.#pointPresenter.forEach((point) => point.destroy());
    this.#pointPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    remove(this.#noPointsMessage);

    if(this.#noPointsMessage) {
      remove(this.#noPointsMessage);
    }

    this.#currentSortType = sortType;
  }

  #handleViewAction = async (userActionType, updateType, update) => {
    this.#uiBlocker.block();
    switch(userActionType) {
      case UserAction.ADD_POINT:
        this.#pointNewPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch(err) {
          this.#pointNewPresenter.setAborting();
        }
        break;
      case UserAction.UPDATE_POINT:
        this.#pointPresenter.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch(err) {
          this.#pointPresenter.get(update.id).setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenter.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch(err) {
          this.#pointPresenter.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, updatedItem) => {
    switch(updateType) {
      case UpdateType.PATCH:
        this.#pointPresenter.get(updatedItem.id).init(updatedItem);
        break;
      case UpdateType.MINOR:
        this.#clearBoard(this.#currentSortType);
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard(SortType.DAY);
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#pointNewPresenter = new PointNew(this.#pointsList.element, this.#offersByTypeModel.offersByType,
          this.#destinationModel.destinations, this.#handleViewAction);
        this.#renderBoard();
        break;
    }
  };

  #onPointModeChange = () => {
    this.#pointPresenter.forEach((point) => point.resetPointMode());
  };

  #handleSortTypeChange = (sortType) => {
    if(sortType === this.#currentSortType) {
      return;
    }
    this.#clearBoard(sortType);
    this.#renderBoard();
  };
}
