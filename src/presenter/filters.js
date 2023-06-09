import Filter from '../view/filter';
import TripInfo from '../view/trip-info';
import { render, RenderPosition, remove, replace } from '../framework/render';
import { filter } from '../utils/filter-util';
import { sortPointsByType } from '../utils/sort-util';
import { UpdateType, SortType } from '../constant';

export default class Filters {
    #filterComponent = null;
    #filterContainer;

    #tripInfoComponent = null;
    #tripInfoContainer;

    #filterModel;
    #pointModel;
    #offersByTypeModel;
    #destinationsModel;

    constructor(filterContainer, tripInfoContainer, filterModel, pointModel, offersByTypeModel, destinationsModel) {
      this.#filterContainer = filterContainer;
      this.#tripInfoContainer = tripInfoContainer;

      this.#filterModel = filterModel;
      this.#pointModel = pointModel;
      this.#offersByTypeModel = offersByTypeModel;
      this.#destinationsModel = destinationsModel;

      this.#filterModel.addObserver(this.#handleModelEvent);
      this.#pointModel.addObserver(this.#handleModelEvent);
    }

    get filters() {
      return Array.from(Object.entries(filter), ([filterType, filterPoints]) => ({
        type: filterType,
        count: filterPoints(this.#pointModel.points).length,
      }));
    }

    get points() {
      return sortPointsByType[SortType.DAY](this.#pointModel.points);
    }

    init() {
      const previousFilterComponent = this.#filterComponent;
      this.#filterComponent = new Filter(this.filters, this.#filterModel.filterType);
      this.#filterComponent.setFilterTypeChangeHandler(this.#handleFilterTypeChange);

      this.#renderTripInfo();

      if (!previousFilterComponent){
        render(this.#filterComponent, this.#filterContainer);
        return;
      }
      replace(this.#filterComponent, previousFilterComponent);
      remove(previousFilterComponent);
    }

    #renderTripInfo(){
      const previousInfoComponent = this.#tripInfoComponent;

      const points = this.points;

      if(points.length && this.#offersByTypeModel.offersByType.length && this.#destinationsModel.destinations.length) {
        this.#tripInfoComponent = new TripInfo(points, this.#getOverallTripPrice(points), this.#destinationsModel.destinations);
      }

      if(previousInfoComponent) {
        replace(this.#tripInfoComponent, previousInfoComponent);
        remove(previousInfoComponent);
      } else if (this.#tripInfoComponent) {
        render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
      }
    }

    #getOverallTripPrice(points) {
      let sum = 0;

      for(const point of points) {
        sum += point.basePrice;
        const currentOffers = this.#offersByTypeModel.offersByType.find((offer) => offer.type === point.type).offers;
        point.offers.forEach((offer) => {
          sum += currentOffers.find((currentOffer) => currentOffer.id === offer).price;
        });
      }

      return sum;
    }

    #handleFilterTypeChange = (filterType) => {
      if(this.#filterModel.filterType === filterType) {
        return;
      }

      this.#filterModel.setFilterType(UpdateType.MAJOR, filterType);
    };

      #handleModelEvent = () => {
        this.init();
      };
}
