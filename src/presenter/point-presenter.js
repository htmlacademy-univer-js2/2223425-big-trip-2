import Point from '../view/point';
import PointEdit from '../view/point-edit';
import { render, replace, remove } from '../framework/render';
import { UserAction, UpdateType, PointMode } from '../constant';
import { areDatesSame } from '../utils/dayjs';

export default class PointPresenter{
    #pointComponent;
    #editFormComponent;
    #pointsListContainer;

    #point;
    #offersByType;
    #destinations;

    #changeData;
    #changePointMode;
    #pointMode;

    constructor(pointsListContainer, offersByType, destinations, changeData, changePointMode) {
      this.#pointsListContainer = pointsListContainer;
      this.#offersByType = offersByType;
      this.#destinations = destinations;

      this.#changeData = changeData;
      this.#changePointMode = changePointMode;

      this.#pointMode = PointMode.DEFAULT;

      this.#pointComponent = null;
      this.#editFormComponent = null;
    }

    init(point) {
      this.#point = point;
      this.#renderPointComponent();
    }

    #renderPointComponent() {
      const previousPointComponent = this.#pointComponent;
      const previousEditFormComponent = this.#editFormComponent;

      this.#pointComponent = new Point(this.#point, this.#offersByType, this.#destinations);

      this.#renderEditFormComponent();

      this.#pointComponent.setFormOpenClickHandler(this.#handleOpenButtonClick);
      this.#pointComponent.setFavoriteButtonHandler(this.#handleFavoriteChangeClick);

      if(previousPointComponent === null || previousEditFormComponent === null) {
        render(this.#pointComponent, this.#pointsListContainer);
        return;
      }

      if(this.#pointMode === PointMode.DEFAULT) {
        replace(this.#pointComponent, previousPointComponent);
      }

      if(this.#pointMode === PointMode.EDITING) {
        replace(this.#pointComponent, previousEditFormComponent);
        this.#point = PointMode.DEFAULT;
      }

      remove(previousPointComponent);
      remove(previousEditFormComponent);
    }

    #renderEditFormComponent() {
      this.#editFormComponent = new PointEdit(this.#point, this.#offersByType, this.#destinations);

      this.#editFormComponent.setFormSubmitHandler(this.#handleFormSubmit);
      this.#editFormComponent.setFormCloseClickHandler(this.#handleFormCloseButtonClick);
      this.#editFormComponent.setFormDeleteHandler(this.#handleDeleteButtonClick);
    }

    destroy() {
      remove(this.#pointComponent);
      remove(this.#editFormComponent);
    }

    resetPointMode() {
      if(this.#pointMode === PointMode.EDITING) {
        this.#replaceFormToPoint();
      }
    }

    setDeleting = () => {
      if (this.#pointMode === PointMode.EDITING) {
        this.#editFormComponent.updateElement({
          isDisabled: true,
          isDeleting: true,
        });
      }
    };

    setSaving = () => {
      if (this.#pointMode === PointMode.EDITING) {
        this.#editFormComponent.updateElement({
          isDisabled: true,
          isSaving: true,
        });
      }
    };

    setAborting = () => {
      if (this.#pointMode === PointMode.DEFAULT) {
        this.#pointComponent.shake();
        return;
      }

      const resetFormState = () => {
        this.#editFormComponent.updateElement({
          isDisabled: false,
          isSaving: false,
          isDeleting: false,
        });
      };

      this.#editFormComponent.shake(resetFormState);
    };

    #replaceFormToPoint() {
      this.#editFormComponent.reset(this.#point);
      replace(this.#pointComponent, this.#editFormComponent);

      document.removeEventListener('keydown', this.#escapeKeyDownHandler);

      this.#pointMode = PointMode.DEFAULT;
    }

    #replacePointToForm() {
      replace(this.#editFormComponent, this.#pointComponent);

      document.addEventListener('keydown', this.#escapeKeyDownHandler);

      this.#changePointMode();
      this.#pointMode = PointMode.EDITING;
    }

    #handleOpenButtonClick = () => {
      this.#replacePointToForm();
    };

    #handleFormCloseButtonClick = () => {
      this.#replaceFormToPoint();
    };

    #handleFormSubmit = (point) => {
      const isMinorUpdate = !areDatesSame(this.#point.dateFrom, point.dateFrom)
      || !areDatesSame(this.#point.dateTo, point.dateTo)
      || this.#point.basePrice !== point.basePrice;
      this.#changeData(UserAction.UPDATE_POINT, isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH, point);
    };

    #escapeKeyDownHandler = (evt) => {
      if(evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        this.#editFormComponent.reset(this.#point);
        this.#replaceFormToPoint();
      }
    };

    #handleFavoriteChangeClick = () => {
      this.#changeData(UserAction.UPDATE_POINT, UpdateType.PATCH, {...this.#point, isFavorite: !this.#point.isFavorite});
    };

    #handleDeleteButtonClick = (point) => {
      this.#changeData(UserAction.DELETE_POINT, UpdateType.MINOR, point);
    };
}
