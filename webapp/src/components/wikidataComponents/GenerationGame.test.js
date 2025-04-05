import QuestionGeneration from './QuestionGeneration';

// Mock global fetch
global.fetch = jest.fn();

// Mock window.crypto.getRandomValues
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn((array) => {
      // Fill with a predictable value for testing, e.g., always pick the first option (index 0)
      for (let i = 0; i < array.length; i++) {
        // A value that results in index 0 when calculation is done
        array[i] = 0;
      }
    }),
  },
});


describe('QuestionGeneration Class', () => {
  let mockSetQuestion;
  let questionGenerator;

  beforeEach(() => {
    mockSetQuestion = jest.fn();
    questionGenerator = new QuestionGeneration(mockSetQuestion);
    fetch.mockClear();
    window.crypto.getRandomValues.mockClear();
    mockSetQuestion.mockClear();
  });

  test('should initialize with empty cache and index 0', () => {
    expect(questionGenerator.questionsCache).toEqual([]);
    expect(questionGenerator.currentIndex).toBe(0);
    expect(questionGenerator.isFetching).toBe(false);
    expect(questionGenerator.currentCity).toBeNull();
  });

  test('generateQuestions should fetch and process data correctly', async () => {
    const mockApiResponse = {
      results: {
        bindings: [
          { cityLabel: { value: 'CityA' }, image: { value: 'imageA.jpg' } },
          { cityLabel: { value: 'CityB' }, image: { value: 'imageB.jpg' } },
          { cityLabel: { value: 'CityC' }, image: { value: 'imageC.jpg' } },
          { cityLabel: { value: 'CityD' }, image: { value: 'imageD.jpg' } },
          { cityLabel: { value: 'CityE' }, image: { value: 'imageE.jpg' } }, // Extra for slicing test
        ],
      },
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const questions = await questionGenerator.generateQuestions();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("https://query.wikidata.org/sparql?query="), expect.objectContaining({ headers: { 'Accept': 'application/sparql-results+json' } }));
    expect(questions).toEqual([
      { city: 'CityA', image: 'imageA.jpg' },
      { city: 'CityB', image: 'imageB.jpg' },
      { city: 'CityC', image: 'imageC.jpg' },
      { city: 'CityD', image: 'imageD.jpg' },
      { city: 'CityE', image: 'imageE.jpg' },
    ]);
  });

   test('generateQuestions should handle API error', async () => {
    fetch.mockRejectedValueOnce(new Error('API Fetch Error'));
    const questions = await questionGenerator.generateQuestions();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(questions).toEqual([]);
    // Check console.error mock if needed
  });

  test('getNextQuestion should return a formatted question and update index/city', () => {
    questionGenerator.questionsCache = [
      { city: 'CityA', image: 'imageA.jpg' },
      { city: 'CityB', image: 'imageB.jpg' },
      { city: 'CityC', image: 'imageC.jpg' },
      { city: 'CityD', image: 'imageD.jpg' },
      { city: 'CityE', image: 'imageE.jpg' },
      { city: 'CityF', image: 'imageF.jpg' },
      { city: 'CityG', image: 'imageG.jpg' },
      { city: 'CityH', image: 'imageH.jpg' },
    ];
    questionGenerator.currentIndex = 0;

    const question = questionGenerator.getNextQuestion();

    // Based on mocked crypto returning index 0
    const expectedCorrectCity = 'CityA';
    const expectedAnswers = {
        'CityA': 'imageA.jpg',
        'CityB': 'imageB.jpg',
        'CityC': 'imageC.jpg',
        'CityD': 'imageD.jpg',
    };

    expect(question).toEqual({
      answers: expectedAnswers,
      correct: expectedCorrectCity,
    });
    expect(questionGenerator.currentIndex).toBe(4);
    expect(questionGenerator.currentCity).toBe(expectedCorrectCity);
    expect(window.crypto.getRandomValues).toHaveBeenCalledTimes(1);

     const question2 = questionGenerator.getNextQuestion();
     const expectedCorrectCity2 = 'CityE'; // Index 0 of the second slice
      expect(question2.correct).toBe(expectedCorrectCity2);
     expect(questionGenerator.currentIndex).toBe(8);
     expect(questionGenerator.currentCity).toBe(expectedCorrectCity2);


  });

  test('getNextQuestion should return null if not enough items in cache', () => {
    questionGenerator.questionsCache = [
      { city: 'CityA', image: 'imageA.jpg' },
      { city: 'CityB', image: 'imageB.jpg' },
    ];
    questionGenerator.currentIndex = 0;
    expect(questionGenerator.getNextQuestion()).toBeNull();
    expect(questionGenerator.questionsCache).toEqual([]); // Cache should be cleared
  });

  test('fetchQuestions should call generateQuestions if cache is empty', async () => {
    const mockGeneratedQuestions = [
      { city: 'GenA', image: 'genA.jpg' }, { city: 'GenB', image: 'genB.jpg' },
      { city: 'GenC', image: 'genC.jpg' }, { city: 'GenD', image: 'genD.jpg' }
    ];
    // Mock generateQuestions directly or via fetch mock
     fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: { bindings: mockGeneratedQuestions.map(q => ({cityLabel: {value: q.city}, image: {value: q.image}})) } }),
    });


    await questionGenerator.fetchQuestions();

    expect(fetch).toHaveBeenCalledTimes(1); // generateQuestions was called via fetch
    expect(questionGenerator.questionsCache.length).toBe(4);
    expect(mockSetQuestion).toHaveBeenCalledTimes(1);
    const expectedQuestionFormat = {
        answers: {
            'GenA': 'genA.jpg', 'GenB': 'genB.jpg',
            'GenC': 'genC.jpg', 'GenD': 'genD.jpg'
        },
        correct: 'GenA' // Due to mocked crypto
    };
    expect(mockSetQuestion).toHaveBeenCalledWith(expectedQuestionFormat);
    expect(questionGenerator.currentCity).toBe('GenA');
     expect(questionGenerator.isFetching).toBe(false);

  });

   test('fetchQuestions should use cache if available', async () => {
     questionGenerator.questionsCache = [
      { city: 'CacheA', image: 'cacheA.jpg' }, { city: 'CacheB', image: 'cacheB.jpg' },
      { city: 'CacheC', image: 'cacheC.jpg' }, { city: 'CacheD', image: 'cacheD.jpg' }
    ];
    questionGenerator.currentIndex = 0;

    await questionGenerator.fetchQuestions();

    expect(fetch).not.toHaveBeenCalled(); // Should not call fetch/generateQuestions
    expect(mockSetQuestion).toHaveBeenCalledTimes(1);
     const expectedQuestionFormat = {
        answers: {
            'CacheA': 'cacheA.jpg', 'CacheB': 'cacheB.jpg',
            'CacheC': 'cacheC.jpg', 'CacheD': 'cacheD.jpg'
        },
        correct: 'CacheA' // Due to mocked crypto
    };
    expect(mockSetQuestion).toHaveBeenCalledWith(expectedQuestionFormat);
     expect(questionGenerator.currentCity).toBe('CacheA');
      expect(questionGenerator.isFetching).toBe(false);
  });

   test('fetchQuestions should not run if already fetching', async () => {
    questionGenerator.isFetching = true;
    await questionGenerator.fetchQuestions();
    expect(fetch).not.toHaveBeenCalled();
    expect(mockSetQuestion).not.toHaveBeenCalled();
  });

    test('fetchQuestions handles error during generation', async () => {
    fetch.mockRejectedValueOnce(new Error('Generation Failed'));

    await questionGenerator.fetchQuestions();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mockSetQuestion).not.toHaveBeenCalled();
    expect(questionGenerator.isFetching).toBe(false);
    // Check console.error mock if needed
  });

  test('getCurrentCity returns the stored city', () => {
     questionGenerator.currentCity = 'TestCity';
     expect(questionGenerator.getCurrentCity()).toBe('TestCity');
  });

});