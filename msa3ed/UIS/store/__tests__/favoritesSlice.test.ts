import favoritesReducer, { setSearchKeyword } from '../slices/favoritesSlice';

describe('favoritesSlice', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
    searchKeyword: '',
  };

  it('should handle initial state', () => {
    expect(favoritesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSearchKeyword', () => {
    const actual = favoritesReducer(initialState, setSearchKeyword('test'));
    expect(actual.searchKeyword).toBe('test');
  });

  it('should handle fetchFavorites.fulfilled', () => {
    const services = [
      { id: '1', title: 'Service 1', description: 'Desc 1', basePrice: 100, categoryName: 'Cat 1', rating: 5, reviewsCount: 10, deliveryTime: '1 day' }
    ];
    const action = { type: 'favorites/fetchAll/fulfilled', payload: services };
    const actual = favoritesReducer(initialState, action);
    expect(actual.items).toEqual(services);
    expect(actual.loading).toBe(false);
  });
});
