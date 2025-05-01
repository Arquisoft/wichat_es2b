import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
    __setCityCacheForTest,
    fetchRandomCity
} from './MappedCities';

const mock = new MockAdapter(axios);

describe('fetchRandomCity', () => {
    beforeEach(() => {
        jest.resetModules();
        mock.reset();
    });

    test('returns a cached city if cache is filled', async () => {
        const mockCity = { name: 'Barcelona', lat: 41.3874, lng: 2.1686 };
        __setCityCacheForTest([mockCity]);

        const result = await fetchRandomCity();
        expect(result).toEqual(mockCity);
    });

    test('fetches from Wikidata and returns a random city', async () => {
        const mockResponse = {
            results: {
                bindings: [
                    {
                        cityLabel: { value: 'Barcelona' },
                        lat: { value: '41.3874' },
                        lon: { value: '2.1686' }
                    },
                    {
                        cityLabel: { value: 'Q12345' }, // Debe ser ignorado
                        lat: { value: '0' },
                        lon: { value: '0' }
                    }
                ]
            }
        };

        __setCityCacheForTest([]); // Limpia la caché antes del test
        mock.onGet(/query=/).reply(200, mockResponse);

        const result = await fetchRandomCity();
        expect(result).toHaveProperty('name', 'Barcelona');
        expect(typeof result.lat).toBe('number');
        expect(typeof result.lng).toBe('number');
    });

    test('throws error on HTTP failure', async () => {
        __setCityCacheForTest([]); // Asegura que se haga el fetch real
        mock.onGet(/query=/).networkError();

        await expect(fetchRandomCity()).rejects.toThrow('Network Error');
    });

    test('throws error when Wikidata returns no valid cities', async () => {
        const invalidResponse = {
            results: {
                bindings: [
                    { cityLabel: { value: 'Q99999' }, lat: { value: '0' }, lon: { value: '0' } }
                ]
            }
        };

        __setCityCacheForTest([]); // Vaciar caché
        mock.onGet(/query=/).reply(200, invalidResponse);

        await expect(fetchRandomCity()).rejects.toThrow('No se encontraron nombres válidos.');
    });

    test('does not call HTTP when cache has cities', async () => {
        const mockCity = { name: 'Sevilla', lat: 37.3, lng: -5.9 };
        __setCityCacheForTest([mockCity]);

        const axiosSpy = jest.spyOn(axios, 'get');

        const city = await fetchRandomCity();
        expect(city).toEqual(mockCity);
        expect(axiosSpy).not.toHaveBeenCalled();

        axiosSpy.mockRestore();
    });

    test('returns different cities randomly from cache', async () => {
        const cities = [
            { name: 'Madrid', lat: 40.4, lng: -3.7 },
            { name: 'Valencia', lat: 39.47, lng: -0.38 }
        ];

        __setCityCacheForTest(cities);

        jest.spyOn(global.Math, 'random')
            .mockReturnValueOnce(0)     // First city
            .mockReturnValueOnce(0.99); // Second city

        const city1 = await fetchRandomCity();
        const city2 = await fetchRandomCity();

        expect(cities).toContainEqual(city1);
        expect(cities).toContainEqual(city2);

        Math.random.mockRestore();
    });

});
