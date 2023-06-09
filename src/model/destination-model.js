import Observable from '../framework/observable';

export default class DestinationModel extends Observable{
  #pointsApiService = null;
  #destinations = [];

  constructor(pointsApiService) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  init = async () => {
    try{
      this.#destinations = await this.#pointsApiService.destinations;
    } catch (err) {
      this.#destinations = [];
    }
  }

  get destinations(){
    return this.#destinations;
  }
}
