const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const { getAdverseEvents } = require('./fda-api.js');

let fetch;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const availableSpecialties = [
    "Cardiologist", "Dermatologist", "Neurologist", "Oncologist", 
    "Pediatrician", "Surgeon", "Psychiatrist", "Gastroenterologist",
    "Endocrinologist", "Ophthalmologist", "ENT Specialist", "Orthopedic Surgeon",
    "Urologist", "Nephrologist", "Pulmonologist", "Allergist/Immunologist",
    "Anesthesiologist", "Obstetrician-Gynecologist (OB/GYN)"
];

const startServer = async () => {
  const { default: nodeFetch } = await import('node-fetch');
  fetch = nodeFetch;
  
  const app = express();
  const port = 3001;

  app.use(cors());

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference/v1/chat/completions";

  // ROUTE 1: For the AI Assistant Chat
  app.post('/api/ai-assistant', upload.single('image'), async (req, res) => {
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub API token is not configured.' });
    }
    try {
      const message = req.body.message || '';
      const imageFile = req.file;

      if (!message && !imageFile) {
        return res.status(400).json({ error: 'A message or an image is required.' });
      }

      const systemPrompt = `You are a helpful AI health assistant for ADR Analysis. Provide general health information, but always include a disclaimer that you are not a medical professional and users should consult their doctor.`;

      const userContent = [];
      if (message) {
        userContent.push({ type: "text", text: message });
      }
      if (imageFile) {
        const base64Image = imageFile.buffer.toString('base64');
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${imageFile.mimetype};base64,${base64Image}` }
        });
      }

      const response = await fetch(GITHUB_MODELS_ENDPOINT, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: userContent } ],
        }),
      });

      if (!response.ok) throw new Error(`AI API error: ${await response.text()}`);
      
      const data = await response.json();
      res.status(200).json({ response: data.choices[0].message.content });

    } catch (error) {
      console.error('Error in /api/ai-assistant:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ROUTE 2: For the Medication Risk Assessment (UPDATED)
  app.post('/api/assess-risk', upload.single('document'), async (req, res) => {
    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'GitHub API token is not configured.' });
    }
    try {
        const medications = JSON.parse(req.body.medications || '[]');
        const conditions = req.body.conditions || 'No additional conditions provided.';
        const healthProfile = JSON.parse(req.body.healthProfile || '{}');

        let fdaData = '';
        for (const med of medications) {
            const events = await getAdverseEvents(med.name); // This will now work correctly
            if (events.length > 0) {
                fdaData += `\n- Top 5 reported adverse events for ${med.name} (from FAERS): ${events.join(', ')}.`;
            }
        }
        const documentFile = req.file;
        let documentText = 'No document provided.';
        if (documentFile) {
            documentText = `An uploaded document named ${documentFile.originalname} is also available for context.`;
        }

        const systemPrompt = `
            You are an expert clinical pharmacologist AI assistant with deep knowledge of both modern medicine and Ayurvedic medicine. Your role is to analyze patient data and provide a detailed, safety-conscious risk assessment with comprehensive alternative suggestions.

            **CRITICAL INSTRUCTIONS:**
            1.  **DO NOT PROVIDE MEDICAL ADVICE.**
            2.  **START EVERY RESPONSE WITH A DISCLAIMER.**
            3.  **Synthesize, Don't Just Repeat:** Do not simply list the adverse events. Synthesize them with the patient's health profile to determine the most relevant risks. For example, if a drug lists "dizziness" and the patient has a history of falls, highlight this specific risk.
            4.  **Recommend a Specialist:** Based on the primary health issues, you MUST recommend ONE specialist from this exact list: [${availableSpecialties.join(", ")}]. If no specialist is clearly relevant, return an empty string for this field.
            5.  **Provide Comprehensive Alternatives:** For each medication, suggest both modern pharmaceutical alternatives AND Ayurvedic alternatives based on the medication's therapeutic purpose and the patient's health profile.
            6.  **Ayurvedic Knowledge:** Use your knowledge of Ayurvedic medicine to suggest appropriate herbs, formulations, and lifestyle recommendations that align with the medication's intended therapeutic effect.
            7.  **Output Format:** You MUST respond with a single, minified JSON object with the following structure:
                {
                  "riskPercentage": number,
                  "summary": "string",
                  "recommendedSpecialist": "string",
                  "alternatives": [ 
                    { 
                      "originalDrug": "string", 
                      "suggestion": "string", 
                      "reasoning": "string",
                      "type": "modern" | "ayurvedic"
                    } 
                  ],
                  "recommendations": [ { "area": "Diet" | "Exercise" | "Monitoring", "advice": "string" } ]
                }

            **AYURVEDIC ALTERNATIVES GUIDELINES:**
            - For pain medications (NSAIDs, opioids): Suggest Ashwagandha, Turmeric, Ginger, Boswellia
            - For anti-inflammatory drugs: Suggest Turmeric, Ginger, Boswellia, Guggulu
            - For antibiotics: Suggest Neem, Tulsi, Garlic, Honey
            - For diabetes medications: Suggest Bitter Gourd, Fenugreek, Cinnamon, Gymnema
            - For hypertension medications: Suggest Arjuna, Sarpagandha, Brahmi, Jatamansi
            - For anxiety/depression medications: Suggest Brahmi, Ashwagandha, Jatamansi, Shankhpushpi
            - For digestive medications: Suggest Triphala, Ginger, Fennel, Peppermint
            - For respiratory medications: Suggest Vasaka, Tulsi, Licorice, Pushkarmool
            - Always include dosage form (powder, decoction, tablet) and basic preparation method
            - Mention any contraindications or precautions for Ayurvedic alternatives
            
            **MANDATORY REQUIREMENT:** You MUST provide at least one Ayurvedic alternative for each medication analyzed. If you cannot find a specific Ayurvedic alternative, suggest general Ayurvedic herbs that support the body system affected by the medication.
        `;

        const userPrompt = `
          Please analyze the following data and provide comprehensive alternative suggestions including both modern pharmaceutical and Ayurvedic alternatives.

          **1. Real-World Data from FDA Adverse Event Reporting System (FAERS):**
          ${fdaData || "No specific adverse event data was found for the provided medications. Please proceed with your general knowledge."}

          **2. Patient Health Profile:**
          ${JSON.stringify(healthProfile)}

          **3. Current Medications for this Analysis:**
          ${JSON.stringify(medications)}

          **4. Additional Conditions:**
          ${conditions}
          
          **5. Document Info:**
          ${documentText}

          **IMPORTANT:** For each medication analyzed, please provide:
          - Modern pharmaceutical alternatives with reasoning
          - Ayurvedic alternatives with specific herbs, formulations, and preparation methods
          - Include dosage forms (powder, decoction, tablet) for Ayurvedic suggestions
          - Mention any contraindications or precautions for Ayurvedic alternatives
          - **MANDATORY:** You MUST include at least one Ayurvedic alternative for each medication
          
          Now, provide your expert analysis in the required JSON format with comprehensive alternatives.
          
        `;

        const response = await fetch(GITHUB_MODELS_ENDPOINT, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-4o',
                messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt } ],
                response_format: { type: "json_object" },
            }),
        });
        
        if (!response.ok) throw new Error(`AI API error: ${await response.text()}`);
        
        const data = await response.json();
        const jsonResponse = JSON.parse(data.choices[0].message.content);
        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error('Error in /api/assess-risk:', error);
        res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`✅ Backend server running with all endpoints on http://localhost:${port}`);
  });
};

startServer().catch(err => {
    console.error("Failed to start server:", err);
});