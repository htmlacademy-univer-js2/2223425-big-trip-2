
import { createElement } from '../render';

window.alert(`Click New Event to create your first point`);

const createNoPointTemplate = () =>
  `<p class="trip-events__msg">
  Click New Event to create your first point</p>`;

export default class PointNull {
  #element = null;
  get template() {
    return createNoPointTemplate;
  }

  get element() {
    if(!this.#element) {
      this.#element = createElement(this.template);
    }
    return this.#element;
  }

  removeElement() {
    this.#element = null;
  }
}