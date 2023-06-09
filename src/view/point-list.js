import AbstractView from '../framework/view/abstract-view.js';


const createPointListTemplate = () => (
  '<ul class="trip-events__list"></ul>'
);

export default class PointList extends AbstractView {
  get template() {
    return createPointListTemplate();
  }
}
