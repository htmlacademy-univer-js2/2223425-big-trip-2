import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { humanizeEventTime } from '../utils/dayjs.js';
import { TYPES } from '../constant.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';

const upperFirstSymbol = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const createDestinationTemplate = (destination) => {
  if(destination.description.length || destination.pictures.length) {
    const pictures = destination.pictures.map((picture) =>
      `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('');
    return(
      `<section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${destination.description}</p>
    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${pictures}
      </div>
    </div>
  </section>`
    );
  }
  return '<section class="event__section  event__section--destination"></section>';
};

const createOffersTemplate = (point, offersByType, disabledTag) => {
  const {offers} = point;

  if(offersByType.length) {
    const currentOffersByType = offersByType.map((offer) => {
      const checked = offers.includes(offer.id) ? 'checked' : '';

      const titleClass = offer.title.toLowerCase().replace(' ', '-');

      return (
        `<div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="event-offer-${titleClass}-1" data-offer-title="${offer.title}" type="checkbox" name="event-offer-${titleClass}" ${checked} ${disabledTag}>
          <label class="event__offer-label" for="event-offer-${titleClass}-1">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>`
      );
    }).join('');

    return(
      `<section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${currentOffersByType}
        </div>
      </section>`
    );
  }
  return '<section class="event__section  event__section--offers"></section>';
};

const createPointType = (currentType) => (
  Array.from(TYPES, (pointType) => {
    const isChecked = pointType === currentType ? 'checked' : '';
    return (`<div class="event__type-item">
                  <input id="event-type-${pointType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${pointType}" ${isChecked}>
                  <label class="event__type-label  event__type-label--${pointType}" for="event-type-${pointType}-1">${upperFirstSymbol(pointType)}</label>
                </div>`);
  }).join('')
);
const createPointEditTemplate = (point, offersByType, destinations, destinationsNames, isNewEvent) => {
  const {basePrice, dateFrom, dateTo, destination, type, isDisabled, isSaving, isDeleting} = point;
  const rollUpButton = isNewEvent ? '' :
    `<button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>`;
  const currentDestination = destinations.find((place) => place.id === destination);
  const disabledTag = isDisabled ? 'disabled' : '';
  const deleteMessage = isDeleting ? 'Deleting...' : 'Delete';
  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${disabledTag}>
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createPointType(type)}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${he.encode(currentDestination.name)}" list="destination-list-1" ${disabledTag}>
            <datalist id="destination-list-1">
            ${Array.from(destinationsNames, (place) => `<option value="${place}"></option>`).join('')}
            </datalist>
          </div>
          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${humanizeEventTime(dateFrom, 'DD/MM/YY HH:mm')}" ${disabledTag}>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${humanizeEventTime(dateTo, 'DD/MM/YY HH:mm')}" ${disabledTag}>
          </div>
          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}" ${disabledTag}>
          </div>
          <button class="event__save-btn  btn  btn--blue" type="submit" ${disabledTag}>${isSaving ? 'Saving...' : 'Save'}</button>
          <button class="event__reset-btn" type="reset" ${disabledTag}>${isNewEvent ? 'Cancel' : deleteMessage}</button>
          ${rollUpButton}
        </header>
        <section class="event__details">
        ${createOffersTemplate(point, offersByType, disabledTag)}
        ${createDestinationTemplate(currentDestination)}
        </section>
      </form>
    </li>`
  );
};
export default class PointEdit extends AbstractStatefulView {
  #datepicker = null;
  #offersByType;
  #offersByCurrentType;
  #destinations;
  #destinationsNames;
  #isNewPoint;
  constructor (point, offersByType, destinations, isNewPoint = false) {
    super();
    this._state = PointEdit.parsePointToState(point);
    this.#offersByType = offersByType;
    this.#offersByCurrentType = this.#offersByType.length ? this.#offersByType.find((offer) => offer.type === point.type).offers : [];
    this.#destinations = destinations;
    this.#destinationsNames = Array.from(this.#destinations, (destination) => destination.name);
    this.#isNewPoint = isNewPoint;
    this.#setInnerHandlers();
    this.#setDatepickerFrom();
    this.#setDatepickerTo();
  }

  get template()
  {
    return createPointEditTemplate(this._state, this.#offersByCurrentType, this.#destinations, this.#destinationsNames, this.#isNewPoint);
  }

  removeElement = () => {
    super.removeElement();

    if (this.#datepicker) {
      this.#datepicker.destroy();
      this.#datepicker = null;
    }
  };

  reset(point) {
    this.#updateOffersByCurrentType(point.type);

    this.updateElement({
      offers: point.offers,
    });

    this.updateElement(PointEdit.parsePointToState(point));
  }

  #updateOffersByCurrentType(newType) {
    this.#offersByCurrentType = this.#offersByType.length ? this.#offersByType.find((offer) => offer.type === newType).offers : [];
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
  }

  setFormCloseClickHandler(callback) {
    this._callback.formCloseClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#formCloseClickHandler);
  }

  setFormDeleteHandler(callback) {
    this._callback.formDelete = callback;

    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);
  }

  _restoreHandlers = () => {
    this.#setInnerHandlers();
    this.#setDatepickerFrom();
    this.#setDatepickerTo();
    this.setFormSubmitHandler(this._callback.formSubmit);
    if(!this.#isNewPoint) {
      this.setFormCloseClickHandler(this._callback.formCloseClick);
    }
    this.setFormDeleteHandler(this._callback.formDelete);
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.formSubmit(PointEdit.parseStateToPoint(this._state));
  }

  #formCloseClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.formCloseClick();
  }

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();

    this._callback.formDelete(PointEdit.parseStateToPoint(this._state));
  };

  #dateFromChangeHandler = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate,
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    this.updateElement({
      dateTo: userDate,
    });
  };

  #setDatepickerFrom = () => {
    if (this._state.dateTo) {
      this.#datepicker = flatpickr(
        this.element.querySelector('#event-start-time-1'),
        {
          enableTime: true,
          dateFormat: 'd/m/y H:i',
          defaultDate: this._state.dateFrom,
          maxDate: this._state.dateTo,
          onChange: this.#dateFromChangeHandler,
        },
      );
    }
  };

  #setDatepickerTo = () => {
    if (this._state.dateFrom) {
      this.#datepicker = flatpickr(
        this.element.querySelector('#event-end-time-1'),
        {
          enableTime: true,
          dateFormat: 'd/m/y H:i',
          defaultDate: this._state.dateTo,
          minDate: this._state.dateFrom,
          onChange: this.#dateToChangeHandler,
        },
      );
    }
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();

    this._setState({
      basePrice: Number(evt.target.value.replace(/[^\d]/g, '')),
    });
  };

  #offerClickHandler = (evt) => {
    if(evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();

    const newOffer = this.#offersByCurrentType.find((offer) => offer.title === evt.target.dataset.offerTitle).id;

    if(this._state.offers.includes(newOffer)) {
      this._state.offers.splice(this._state.offers.indexOf(newOffer), 1);
    } else {
      this._state.offers.push(newOffer);
    }

    this.updateElement({
      offers: this._state.offers,
    });
  };

  #pointTypeClickHandler = (evt) => {
    if(evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();
    this._state.offers = [];
    this.#updateOffersByCurrentType(evt.target.value);

    this.updateElement({
      type: evt.target.value,
    });
  };

  #pointPlaceChangeHandler = (evt) => {
    if(!this.#destinationsNames.includes(evt.target.value)) {
      return;
    }
    evt.preventDefault();

    this.updateElement({
      destination: this.#destinations.find((place)=>place.name === evt.target.value).id,
    });
  };

  #setInnerHandlers = () => {
    this.element.querySelector('.event__type-group').addEventListener('click', this.#pointTypeClickHandler);
    this.element.querySelector('#event-destination-1').addEventListener('change', this.#pointPlaceChangeHandler);
    if(this.#offersByType.length && this.#offersByCurrentType.length) {
      this.element.querySelector('.event__available-offers').addEventListener('click', this.#offerClickHandler);
    }
    this.element.querySelector('#event-price-1').addEventListener('input', this.#priceInputHandler);
  };

  static parseStateToPoint(state){
    const point = {...state};
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    return point;
  }

  static parsePointToState(point){
    return{...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }
}
