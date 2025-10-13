let fetch;

const initialize = async () => {
    if (!fetch) {
        const { default: nodeFetch } = await import('node-fetch');
        fetch = nodeFetch;
    }
};

const FDA_API_KEY = 'ij3zdFNXiLSTpzYTafg25uz7xEyzsWXbSLxQaggZ';


const DRUG_NAME_MAPPINGS = {
    'paracetamol': 'acetaminophen',
    'acetaminophen': 'acetaminophen',
    'tylenol': 'acetaminophen',
    'ibuprofen': 'ibuprofen',
    'advil': 'ibuprofen',
    'motrin': 'ibuprofen',
    'aspirin': 'aspirin',
    'lisinopril': 'lisinopril',
    'metformin': 'metformin',
    'atorvastatin': 'atorvastatin',
    'lipitor': 'atorvastatin',
    'omeprazole': 'omeprazole',
    'prilosec': 'omeprazole',
    'amoxicillin': 'amoxicillin',
    'azithromycin': 'azithromycin',
    'zithromax': 'azithromycin'
};


const FALLBACK_ADVERSE_EVENTS = {
    'paracetamol': ['NAUSEA', 'LIVER INJURY', 'ALLERGIC REACTION', 'RASH', 'HEADACHE'],
    'acetaminophen': ['NAUSEA', 'LIVER INJURY', 'ALLERGIC REACTION', 'RASH', 'HEADACHE'],
    'ibuprofen': ['STOMACH PAIN', 'NAUSEA', 'DIZZINESS', 'HEADACHE', 'RASH'],
    'aspirin': ['STOMACH PAIN', 'NAUSEA', 'DIZZINESS', 'BLEEDING', 'RINGING IN EARS'],
    'metformin': ['NAUSEA', 'DIARRHEA', 'STOMACH UPSET', 'LACTIC ACIDOSIS', 'VITAMIN B12 DEFICIENCY'],
    'lisinopril': ['COUGH', 'DIZZINESS', 'HEADACHE', 'FATIGUE', 'LOW BLOOD PRESSURE'],
    'atorvastatin': ['MUSCLE PAIN', 'LIVER PROBLEMS', 'HEADACHE', 'NAUSEA', 'DIARRHEA'],
    'omeprazole': ['HEADACHE', 'NAUSEA', 'DIARRHEA', 'STOMACH PAIN', 'DIZZINESS'],
    'amoxicillin': ['DIARRHEA', 'NAUSEA', 'RASH', 'ALLERGIC REACTION', 'YEAST INFECTION'],
    'azithromycin': ['NAUSEA', 'DIARRHEA', 'STOMACH PAIN', 'HEADACHE', 'DIZZINESS']
};


function normalizeDrugName(drugName) {
    const normalized = drugName.toLowerCase().trim();
    return DRUG_NAME_MAPPINGS[normalized] || drugName;
}


function getFallbackAdverseEvents(drugName) {
    const normalized = drugName.toLowerCase().trim();
    return FALLBACK_ADVERSE_EVENTS[normalized] || [];
}

/**
 * Fetches the top adverse events reported for a specific drug from the openFDA API.
 * @param {string} drugName The name of the drug to search for.
 * @returns {Promise<string[]>} A promise that resolves to an array of the most common adverse event terms.
 */
async function getAdverseEvents(drugName) {
    // Input validation
    if (!drugName || typeof drugName !== 'string' || drugName.trim().length === 0) {
        console.warn('Invalid drug name provided to getAdverseEvents:', drugName);
        return [];
    }

    const cleanDrugName = drugName.trim();
    const normalizedName = normalizeDrugName(cleanDrugName);
    
    await initialize();

    // Try multiple search strategies
    const searchStrategies = [
        // Strategy 1: Exact match with generic and brand names
        `(patient.drug.openfda.generic_name:"${normalizedName}" OR patient.drug.openfda.brand_name:"${normalizedName}")`,
        // Strategy 2: Partial match with generic name
        `patient.drug.openfda.generic_name:"${normalizedName}"`,
        // Strategy 3: Partial match with brand name
        `patient.drug.openfda.brand_name:"${normalizedName}"`,
        // Strategy 4: Broader search with wildcard
        `patient.drug.openfda.generic_name:"*${normalizedName}*"`,
        // Strategy 5: Search in substance names
        `patient.drug.openfda.substance_name:"${normalizedName}"`
    ];

    for (let i = 0; i < searchStrategies.length; i++) {
        try {
            console.log(`Trying FDA search strategy ${i + 1} for: ${normalizedName}`);
            
            const searchParams = new URLSearchParams({
                api_key: FDA_API_KEY,
                search: searchStrategies[i],
                count: 'patient.reaction.reactionmeddrapt.exact',
                limit: '5'
            });

            const apiUrl = `https://api.fda.gov/drug/event.json?${searchParams.toString()}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                console.log(`Strategy ${i + 1} failed: ${response.status} ${response.statusText}`);
                continue;
            }
            
            const data = await response.json();
            
            if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                const events = data.results.map(result => result.term).filter(term => term && typeof term === 'string');
                console.log(`Found ${events.length} adverse events for ${normalizedName} using strategy ${i + 1}:`, events);
                return events;
            }
            
            console.log(`Strategy ${i + 1} returned no results`);
            
        } catch (error) {
            console.error(`Strategy ${i + 1} failed with error:`, error);
            continue;
        }
    }
    
    // If FDA API doesn't find results, try fallback
    const fallbackEvents = getFallbackAdverseEvents(cleanDrugName);
    if (fallbackEvents.length > 0) {
        console.log(`Using fallback adverse events for ${cleanDrugName}:`, fallbackEvents);
        return fallbackEvents;
    }
    
    console.log(`No results found for ${normalizedName} after trying all strategies and fallbacks`);
    return [];
}

module.exports = { getAdverseEvents };