import TripList from '../view/trip-list.js';
import Point from '../view/point.js';
import Sort from '../view/sort.js';
import { render } from '../render.js';
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
    const pointPreviewComponent = new Point(point, this.#destinations, this.#offers);
    const editingPointComponent = new PointEdit(point, this.#destinations, this.#offers);

    const replacePointToEditForm = () => {
      this.#eventsList.element.replaceChild(
        editingPointComponent.element,
        pointPreviewComponent.element
      );
    };

    const replaceEditFormToPoint = () => {
      this.#eventsList.element.replaceChild(
        pointPreviewComponent.element,
        editingPointComponent.element
      );
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replaceEditFormToPoint();
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    pointPreviewComponent.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', () => {
        replacePointToEditForm();
        document.addEventListener('keydown', onEscKeyDown);
      });

    editingPointComponent.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', (evt) => {
        evt.preventDefault();
        replaceEditFormToPoint();
        document.removeEventListener('keydown', onEscKeyDown);
      });

    editingPointComponent.element
      .querySelector('form')
      .addEventListener('submit', (evt) => {
        evt.preventDefault();
        replaceEditFormToPoint();
        document.removeEventListener('keydown', onEscKeyDown);
      });

    render(pointPreviewComponent, this.#eventsList.element);
  }
}

