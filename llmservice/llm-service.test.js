const request = require('supertest');
const axios = require('axios');
const app = require('./llm-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

describe('LLM Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.startsWith('https://generativelanguage')) {
      return Promise.resolve({ data: { candidates: [{ content: { parts: [{ text: 'llmanswer' }] } }] } });
    } else if (url.endsWith('https://empathyai')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  // Test /hint endpoint
  it('the llm should reply', async () => {
    const response = await request(app)
      .post('/hint')
      .send({ question: 'a question', apiKey: 'apiKey', model: 'gemini' });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });

});