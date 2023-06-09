import AbstractView from '../framework/view/abstract-view.js';
import { humanizeEventTime, getTimeDifference } from '../utils/dayjs.js';
import { PointMode } from '../constant.js';
import he from 'he';


const createPointTemplate = (point, offersByType, destinations) => {
  const {basePrice, dateFrom, dateTo, destination, isFavorite, offers, type} = point;
  const isFavoriteButtonClass = isFavorite ? 'event__favorite-btn--active' : '';
  const timeDifference = getTimeDifference(dateFrom, dateTo);
  const currentDestination = destinations.find((place) => place.id === destination);

  const pointOffersByType = offersByType.length && offers.length ? offersByType
    .find((offer) => offer.type === type)
    .offers.map((offer) => !offers.includes(offer.id) ? '' : (
      `<li class="event__offer">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </li>`
    )).join('') : '';

  return (
    `<li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${humanizeEventTime(dateFrom, 'YYYY-MM-DD')}">${humanizeEventTime(dateFrom, 'MMM D')}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${type} ${he.encode(currentDestination.name)}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${humanizeEventTime(dateFrom, 'YYYY-MM-DD[T]HH:mm')}">${humanizeEventTime(dateFrom, 'HH:mm')}</time>
            &mdash;
            <time class="event__end-time" datetime="${humanizeEventTime(dateTo, 'YYYY-MM-DD[T]HH:mm')}">${humanizeEventTime(dateTo, 'HH:mm')}</time>
          </p>
          <p class="event__duration">${timeDifference}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${pointOffersByType}
        </ul>
        <button class="event__favorite-btn ${isFavoriteButtonClass}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`);
};

export default class Point extends AbstractView{
  #point;
  #offersByType;
  #destinations;

  constructor(point, offersByType, destinations) {
    super();
    this.#point = point;
    this.#offersByType = offersByType;
    this.#destinations = destinations;
    this.pointMode = PointMode.DEFAULT;
  }

  get template() {
    return createPointTemplate(this.#point, this.#offersByType, this.#destinations);
  }

  setFormOpenClickHandler(callback) {
    this._callback.formOpenClick = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#formOpenClickHandler);
  }

  setFavoriteButtonHandler(callback) {
    this._callback.favoriteClick = callback;
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteButtonClickHandler);
  }

  #formOpenClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.formOpenClick();
  };

  #favoriteButtonClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.favoriteClick();
  };
}
