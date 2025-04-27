const axios = require('axios');
const express = require('express');

const app = express();
const port = 8003;

app.use(express.json());

const gameSystemInstruction = "Actuarás como un juego de adivinanzas de ciudades. Recibirás mensajes con el siguiente formato: '<Ciudad>:<Mensaje del usuario>'. Tu objetivo es ayudar al usuario a adivinar la ciudad oculta, proporcionando pistas útiles y relevantes basadas en sus preguntas. Bajo ninguna circunstancia debes revelar el nombre de la ciudad. Mantén las respuestas concisas y enfocadas en proporcionar pistas que ayuden al usuario a deducir la ciudad. Si el usuario hace una pregunta que no está relacionada con la adivinanza, responde de forma educada y vuelve a enfocar la conversación en el juego.";

const llmConfigs = {
  gemini: {
    url: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    transformRequest: (systemInstruction, question) => ({
      contents: [
        {
          parts: [
            { text: systemInstruction },
            { text: question }
          ]
        }
      ]
    }),
    transformResponse: (response) => response.data.candidates[0]?.content?.parts[0]?.text
  },
  empathy: {
    url: () => 'https://empathyai.prod.empathy.co/v1/chat/completions',
    transformRequest: (systemInstruction, question) => ({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { role: "system", content: systemInstruction || "You are a helpful assistant." },
        { role: "user", content: question }
      ]
    }),
    transformResponse: (response) => response.data.choices[0]?.message?.content,
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
};

function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

async function sendQuestionToLLM(question, apiKey, model = 'gemini', systemInstruction = '') {
  const config = llmConfigs[model];
  if (!config) {
    throw new Error(`Model "${model}" is not supported.`);
  }

  const url = config.url(apiKey);
  const requestData = config.transformRequest(systemInstruction, question);

  const headers = {
    'Content-Type': 'application/json',
    ...(config.headers ? config.headers(apiKey) : {})
  };

  try {
    const response = await axios.post(url, requestData, { headers });
    
    const transformedResponse = config.transformResponse(response);
    if (transformedResponse === undefined || transformedResponse === null) {
        console.error(`Error transforming LLM response for ${model}. Response data:`, JSON.stringify(response.data, null, 2));
        throw new Error(`Received unexpected response structure from ${model} LLM.`);
    }
    return transformedResponse;

  } catch (error) {
    console.error(`Error sending question to ${model} LLM:`, error.response?.data || error.message || error);
    throw new Error(`Failed to get response from ${model} LLM.`);
  }
}

app.post('/ask', async (req, res) => {
  try {
    validateRequiredFields(req, ['question', 'model', 'apiKey']);
    const { question, model, apiKey } = req.body;

    const answer = await sendQuestionToLLM(question, apiKey, model, ''); 
    res.json({ answer });

  } catch (error) {
    console.error("Error in /ask endpoint:", error);
    const statusCode = error.message.startsWith("Missing required field") ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

app.post('/hint', async (req, res) => {
  try {
    validateRequiredFields(req, ['question', 'model', 'apiKey']);
    const { question, model, apiKey } = req.body;

    const answer = await sendQuestionToLLM(question, apiKey, model, gameSystemInstruction);
    res.json({ answer });

  } catch (error) {
    console.error("Error in /hint endpoint:", error);
    const statusCode = error.message.startsWith("Missing required field") ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server;