import Observable from '../framework/observable';
import { UpdateType } from '../constant';

export default class PointsModel extends Observable{
  #pointsApiService = null;
  #points = [];
  constructor(pointsApiService) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  init = async () => {
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map(this.#adaptToClient);
    } catch(err) {
      this.#points = [];
    }
    this._notify(UpdateType.INIT);
  };

  get points() {
    return this.#points;
  }

  addPoint = async (updateType, update) => {
    try{
      const response = await this.#pointsApiService.createPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch (err){
      throw new Error('Can\'t add point');
    }
  };

  updatePoint = async (updateType, update) => {
    const index = this.#points.findIndex((item) => item.id === update.id);

    if(index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);
      this.#points = [...this.#points.slice(0, index), updatedPoint, ...this.#points.slice(index + 1)];
      this._notify(updateType, updatedPoint);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  };

  deletePoint = async (updateType, update) => {
    const index = this.#points.findIndex((item) => item.id === update.id);

    if(index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }
    try {
      await this.#pointsApiService.deletePoint(update);
      this.#points = [...this.#points.slice(0, index), ...this.#points.slice(index + 1)];
      this._notify(updateType);
    } catch(err) {
      throw new Error('Can\'t delete point');
    }

    this._notify(updateType);
  };

  #adaptToClient(point) {
    const adaptedPoint = {...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }
}
