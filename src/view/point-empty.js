import AbstractView from '../framework/view/abstract-view';
import { FilterTypes } from '../constant';

const MessagesByFilterType = {
  [FilterTypes.EVERYTHING]: 'Click New Event to create your first point',
  [FilterTypes.FUTURE]: 'There are no future events now',
  [FilterTypes.PAST]: 'There are no past events now',
};

const createEmptyPointsTemplate = (filterType) => `<p class="trip-events__msg">${MessagesByFilterType[filterType]}</p>`;


export default class PointEmpty extends AbstractView {
  #filterType;

  constructor(filterType) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createEmptyPointsTemplate(this.#filterType);
  }
}
