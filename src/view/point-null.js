import AbstractView from '../framework/view/abstract-view';

const createNoPointTemplate = () =>
  `<p class="trip-events__msg">
  Click New Event to create your first point</p>`;

export default class PointNull extends AbstractView {
  get template() {
    return createNoPointTemplate;
  }

}


