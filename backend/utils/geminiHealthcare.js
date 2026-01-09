const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper to calculate real distance between two GPS coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const getNearbyHealthcare = async (lat, lon) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // We try with grounding tool first, if it fails we fall back to internal knowledge
  const getResults = async (useGrounding = true, modelToUse = "gemini-2.5-flash") => {
    const modelConfig = {
      model: modelToUse,
    };

    // googleSearch is the modern tool name for Gemini 1.5, 2.0, and 2.5
    if (useGrounding) {
      modelConfig.tools = [{ googleSearch: {} }];
    }

    const model = genAI.getGenerativeModel(modelConfig);

    const prompt = `You are a healthcare assistant. Your task is to find REAL, CURRENT nearby healthcare facilities (hospitals, clinics, doctors, pharmacies) closest to these GPS coordinates:
    Latitude: ${lat}
    Longitude: ${lon}
    
    LOCAL CONTEXT: The user is in the Ujire/Belthangady region of Karnataka. 
    Look specifically for well-known local facilities such as:
    - SDM Multi-Speciality Hospital, Ujire
    - Benaka Health Centre, Ujire
    - Ashwini Multispeciality Clinic
    - Jyothi Hospital, Belthangady
    - Damodar Hospital
    - Taluk Hospital Belthangady
    - Sri Krishna Hospital, Kakkinje
    
    INSTRUCTIONS:
    1. Use Google Search grounding to find the actual current status, addresses, and GPS coordinates for these and other nearby medical facilities.
    2. Provide a diverse mix of at least 10 facilities.
    3. For EACH facility, provide its real address and approximate Latitude/Longitude.
    
    Return the result ONLY as a JSON array of objects with this schema:
    [
      {
        "name": "string",
        "type": "Hospital" | "Doctor" | "Medical Store",
        "address": "string",
        "description": "short description of services",
        "lat": number,
        "lon": number
      }
    ]
    
    Return ONLY JSON. Do not include any other text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean up response
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/```\n?/, '').replace(/\n?```/, '');
      }

      const facilities = JSON.parse(text);

      // Now calculate REAL distance using Haversine formula
      return facilities.map(f => {
        let distanceStr = "Unknown";
        if (f.lat && f.lon) {
          const dist = haversineDistance(lat, lon, f.lat, f.lon);
          distanceStr = `${dist} km`;
        }
        return {
          name: f.name,
          type: f.type,
          address: f.address,
          description: f.description,
          distance: distanceStr
        };
      });

    } catch (error) {
      // If quota issue (429) or grounding not supported, fall back
      if (useGrounding) {
        console.warn(`Grounding with ${modelToUse} failed or reached quota. Falling back to internal knowledge...`);
        return getResults(false, modelToUse);
      }
      // If 2.5 flash failed, try a very basic fallback
      if (modelToUse === "gemini-2.5-flash") {
        console.warn("Gemini 2.5 Flash failed, trying gemini-1.5-flash as a final check...");
        return getResults(false, "gemini-1.5-flash");
      }
      throw error;
    }
  };

  try {
    return await getResults(true);
  } catch (error) {
    console.error("Error in getNearbyHealthcare (Gemini 2.5):", error);
    return [];
  }
};

module.exports = { getNearbyHealthcare };
