import Observable from '../framework/observable.js';

export default class OfferModel extends Observable{
  #pointsApiService = null;
  #offersByType = [];
  constructor(pointsApiService){
    super();
    this.#pointsApiService = pointsApiService;
  }

  init = async () => {
    try{
      this.#offersByType = await this.#pointsApiService.offers;
    } catch (err) {
      this.offers = [];
    }
  }

  get offersByType(){
    return this.#offersByType;
  }
}
