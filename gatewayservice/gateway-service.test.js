const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');

const PWD_USER_1 = 'testpassword1';
const NEW_USER_1 = 'newpassword';

describe('Gateway Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/hint')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }else if (url.endsWith('/questions')) {
      return Promise.resolve({data: {answer: 'questionAnswer'}})
    }else if (url.endsWith('/api/stats')){
      return Promise.resolve({data: {answer: 'apiStats'}})
    }
  });

  it('should forward a health request', async () => {
    const response = await request(app).get('/health')
        .expect(200);
  });

  it('should forward login request to auth service', async () => {
    const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: PWD_USER_1 })
        .expect(200);

    expect(response.body.token).toBe('mockedToken');
  });

  it('should fail login with missing credentials', async () => {
    const response = await request(app)
        .post('/login');


    expect(response.body.error).toBe();
  });

  it('should forward add user request to user service', async () => {
    const response = await request(app)
        .post('/adduser')
        .send({ username: 'newuser', password: NEW_USER_1 })
        .expect(200);


    expect(response.body.userId).toBe('mockedUserId');
  });

  it('should fail add user with missing data', async () => {
    const response = await request(app)
        .post('/adduser');

    expect(response.body.error).toBe();
  });

  it('should forward askllm request to the LLM service', async () => {
    const response = await request(app)
        .post('/hint')
        .send({ question: 'question', model: 'gemini', apiKey: 'apiKey' })
        .expect(200);

    expect(response.body.answer).toBe('llmanswer');
  });

  it('should fail askllm with missing parameters', async () => {
    const response = await request(app)
        .post('/hint');

    expect(response.body.error).toBe();
  });

  it('should ask for the questions in /questions', async () => {
    const response = await request(app)
        .get('/questions')
        .expect('Content-Type', /json/)
        .expect(200);
  });

  it('should ask for the /stats of a user', async () => {
    const newUser = {
      username: 'testuser',
      password: PWD_USER_1,
    };

    const res = await request(app).post('/adduser').send(newUser).expect(200);

    const response = await request(app)
        .get('/api/stats').query(newUser).expect(200);


  });


  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Wrong URL: Please, check the correct enpoint URL');
  });

  it('should accept valid frontend metric', async () => {
    const response = await request(app)
        .post('/frontend-metrics')
        .send({ name: 'CLS', value: 0.15 })
        .expect(200);

    expect(response.body.status).toBe('Metric updated');
  });

  it('should reject unknown metric name', async () => {
    const response = await request(app)
        .post('/frontend-metrics')
        .send({ name: 'UNKNOWN', value: 0.5 })
        .expect(400);

    expect(response.body.status).toBe('Unknown metric name');
  });

  it('should reject invalid frontend metric format', async () => {
    const response = await request(app)
        .post('/frontend-metrics')
        .send({ invalid: 'data' })
        .expect(400);

    expect(response.body.status).toBe('Invalid metric format');
  });

  it('should return Prometheus metrics', async () => {
    const response = await request(app)
        .get('/metrics')
        .expect('Content-Type', /text\/plain/)
        .expect(200);

    expect(response.text).toContain('web_vitals_cls'); // alguna métrica que definas
  });


});