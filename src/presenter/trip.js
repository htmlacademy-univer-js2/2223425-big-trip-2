import TripList from '../view/trip-list.js';
import Point from '../view/point.js';
import Sort from '../view/sort.js';
import { render, replace } from '../framework/render.js';
import PointNull from '../view/point-null.js';
import PointEdit from '../view/point-edit.js';

export default class TripEventsPresenter {
  #eventsList = null;
  #tripContainer = null;
  #pointsModel = null;
  #boardPoints = null;
  #destinations = null;
  #offers = null;

  constructor(tripContainer) {
    this.#eventsList = new TripList();
    this.#tripContainer = tripContainer;
  }

  init(pointsModel) {
    this.#pointsModel = pointsModel;
    this.#boardPoints = [...this.#pointsModel.points];
    this.#destinations = [...this.#pointsModel.destinations];
    this.#offers = [...this.#pointsModel.offers];


    if(this.#boardPoints.length === 0) {
      render(new PointNull(), this.#tripContainer);
    } else {
      render(new Sort(), this.#tripContainer);
      render(this.#eventsList, this.#tripContainer);
      for (const point of this.#boardPoints) {
        this.#renderPoints(point);
      }
    }

  }

  #renderPoints = (point) => {
    const pointComponent = new Point(point, this.#destinations, this.#offers);
    const pointEditComponent = new PointEdit(point, this.#destinations, this.#offers);

    const replacePointToEditForm = () => {
      replace(
        pointEditComponent, pointComponent
      );
    };

    const replaceEditFormToPoint = () => {
      replace(
        pointComponent, pointEditComponent
      );
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replaceEditFormToPoint();
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    pointComponent.setEditClickHandler(() => {
      replacePointToEditForm();
      document.addEventListener('keydown', onEscKeyDown);
    });

    pointEditComponent.setPreviewClickHandler(() => {
      replaceEditFormToPoint();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    pointEditComponent.setFormSubmitHandler(() => {
      replaceEditFormToPoint();
      document.removeEventListener('keydown', onEscKeyDown);
    });

    render(pointComponent, this.#eventsList.element);
  }
}

