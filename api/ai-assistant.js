const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// This is where your secret token will be used.
// On Vercel, it will be read from environment variables.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference/v1/chat/completions";

// AI Model Configuration - Using the latest available model
// Available models: 'openai/gpt-4o', 'openai/gpt-4o-mini', 'anthropic/claude-3-5-sonnet'
// Note: GPT-5 is not yet publicly available through GitHub AI
const AI_MODEL = 'openai/gpt-4o'; // Latest stable model for best performance

app.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    const systemPrompt = `
      You are an AI health assistant for ADR Analysis.
      Your purpose is to provide helpful, general health information.
      You must not provide medical advice. Always preface any health-related information with a clear disclaimer that the user should consult a qualified healthcare professional.
    `;

    const response = await fetch(GITHUB_MODELS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub Models API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    res.status(200).json({ response: assistantResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;