const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8000;

//CONFIGURATIONS

const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const gameServiceUrl = process.env.GAME_SERVICE_URL || 'http://localhost:8004';

app.use(cors());
app.use(express.json());


//Prometheus configuration
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

//ENDPOINTS

const promClient = require('prom-client'); // Agrega arriba

// Crea un "registry" personalizado
const register = new promClient.Registry();

// Define las métricas que quieres exponer
const webVitalsMetrics = {
    CLS: new promClient.Gauge({ name: 'web_vitals_cls', help: 'Cumulative Layout Shift' }),
    FID: new promClient.Gauge({ name: 'web_vitals_fid', help: 'First Input Delay' }),
    FCP: new promClient.Gauge({ name: 'web_vitals_fcp', help: 'First Contentful Paint' }),
    LCP: new promClient.Gauge({ name: 'web_vitals_lcp', help: 'Largest Contentful Paint' }),
    TTFB: new promClient.Gauge({ name: 'web_vitals_ttfb', help: 'Time to First Byte' }),
};

// Registra las métricas
Object.values(webVitalsMetrics).forEach(metric => register.registerMetric(metric));


app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    const metricsFromDefault = await metricsMiddleware.metrics();
    const metricsFromFrontend = await register.metrics();
    res.end(metricsFromDefault + '\n' + metricsFromFrontend);
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
  res.status(200);
});

app.get('/api/stats',async(req,res)=>{

    const userResponse = await axios.get(userServiceUrl+'/api/stats', req.body);
    res.json(userResponse).status(200);

});

app.get('/questions', async (req, res) => {

    const wikiResponse = await axios.get(gameServiceUrl + '/questions', req.body);
    res.json(wikiResponse).status(200);

});

app.post('/login', async (req, res) => {

    try
    {
      const authResponse = await axios.post(authServiceUrl+'/login', req.body);
      res.json(authResponse.data);
    } catch (error) 
    {
      res.status(400).json({ error: error.response.data.error });
    }
});

app.post('/adduser', async (req, res) => {

    try
    {
      // Forward the add user request to the user service
      const userResponse = await axios.post(userServiceUrl+'/adduser', req.body);
      res.json(userResponse.data);
    } catch (error) 
    {
      res.status(400).json({ error: error.response.data.error });
    }

});

// Endpoint para recibir métricas del frontend
app.post('/frontend-metrics', (req, res) => {
    const metric = req.body;

    if (metric.name && metric.value !== undefined) {
        const gauge = webVitalsMetrics[metric.name.toUpperCase()];
        if (gauge) {
            gauge.set(metric.value);
            res.status(200).json({ status: 'Metric updated' });
        } else {
            res.status(400).json({ status: 'Unknown metric name' });
        }
    } else {
        res.status(400).json({ status: 'Invalid metric format' });
    }
});

app.post('/hint', async (req, res) => {

    const llmResponse = await axios.post(llmServiceUrl+'/hint', req.body, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json(llmResponse.data);

});


// Read the OpenAPI YAML file synchronously
openapiPath='./openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}

app.get('/*', (_req,res) =>{
  res.status(404).json({
    status:"not found",
    message:"Wrong URL: Please, check the correct enpoint URL"
  });
});

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server
