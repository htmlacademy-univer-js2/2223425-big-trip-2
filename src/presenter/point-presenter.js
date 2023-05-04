import { render, replace, remove } from '../framework/render.js';
import Point from '../view/point.js';
import PointEdit from '../view/point-edit.js';

const Mode = {
  PREVIEW: 'preview',
  EDITING: 'editing',
};

export default class PointPresenter {
  #pointListContainer = null;
  #previewPointComponent = null;
  #editingPointComponent = null;
  #pointsModel = null;

  #destinations = null;
  #offers = null;

  #changeData = null;
  #changeMode = null;

  #point = null;
  #mode = Mode.PREVIEW;

  constructor(pointListContainer, pointsModel, changeData, changeMode) {
    this.#pointListContainer = pointListContainer;
    this.#pointsModel = pointsModel;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init(point) {
    this.#point = point;
    this.#destinations = [...this.#pointsModel.destinations];
    this.#offers = [...this.#pointsModel.offers];

    const prevPreviewPointComponent = this.#previewPointComponent;
    const prevEditingPointComponent =  this.#editingPointComponent;

    this.#previewPointComponent = new Point(point, this.#destinations, this.#offers);
    this.#editingPointComponent = new PointEdit(point, this.#destinations, this.#offers);

    this.#previewPointComponent.setEditClickHandler(this.#handleEditClick);
    this.#previewPointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    this.#editingPointComponent.setPreviewClickHandler(this.#handlePreviewClick);
    this.#editingPointComponent.setFormSubmitHandler(this.#handleFormSubmit);

    if (prevPreviewPointComponent === null || prevEditingPointComponent === null) {
      render(this.#previewPointComponent, this.#pointListContainer);
      return;
    }

    if (this.#mode === Mode.PREVIEW) {
      replace(this.#previewPointComponent, prevPreviewPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#editingPointComponent, prevEditingPointComponent);
    }

    remove(prevPreviewPointComponent);
    remove(prevEditingPointComponent);
  }

  destroy = () => {
    remove(this.#previewPointComponent);
    remove(this.#editingPointComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.PREVIEW) {
      this.#replaceEditingPointToPreviewPoint();
    }
  };

  #replacePreviewPointToEditingPoint = () => {
    replace(this.#editingPointComponent, this.#previewPointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#changeMode();
    this.#mode = Mode.EDITING;
  };

  #replaceEditingPointToPreviewPoint = () => {
    replace(this.#previewPointComponent, this.#editingPointComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.PREVIEW;
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replaceEditingPointToPreviewPoint();
    }
  };

  #handleFavoriteClick = () => {
    this.#changeData({...this.#point, isFavorite: !this.#point.isFavorite});
  };

  #handleEditClick = () => {
    this.#replacePreviewPointToEditingPoint();
  };

  #handlePreviewClick = (evt) => {
    evt.preventDefault();
    this.#replaceEditingPointToPreviewPoint();
  };

  #handleFormSubmit = (point) => {
    this.#changeData(point);
    this.#replaceEditingPointToPreviewPoint();
  };
}
