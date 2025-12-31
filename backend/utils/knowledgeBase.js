const drugKnowledge = [
    {
        name: "Paracetamol",
        interactions: ["Alcohol increases risk of liver damage", "Warfarin may have increased effect"],
        ayurvedic_alternatives: "Nimba (Neem), Amrita (Guduchi) for fever/inflammation",
        precautions: "Avoid if you have liver disease"
    },
    {
        name: "Ibuprofen",
        interactions: ["Aspirin may increase bleeding risk", "ACE inhibitors may be less effective"],
        ayurvedic_alternatives: "Shunti (Ginger), Haridra (Turmeric) for pain/inflammation",
        precautions: "May cause stomach irritation"
    },
    {
        name: "Metformin",
        interactions: ["Contrast dye (wait 48 hours)", "Alcohol may increase risk of lactic acidosis"],
        ayurvedic_alternatives: "Karavellaka (Bitter Gourd), Methika (Fenugreek)",
        precautions: "Monitor kidney function"
    },
    {
        name: "Aspirin",
        interactions: ["NSAIDs increase bleeding risk", "Warfarin may have synergistic effect"],
        ayurvedic_alternatives: "Guggulu (Purified Commiphora mukul), Lasuna (Garlic) for natural anti-platelet effect",
        precautions: "Risk of gastric ulcers; monitor for signs of internal bleeding"
    },
    {
        name: "Lisinopril",
        interactions: ["Potassium supplements may cause hyperkalemia", "NSAIDs may decrease BP-lowering effect"],
        ayurvedic_alternatives: "Arjuna (Terminalia arjuna), Sarpagandha (Rauwolfia serpentina) for blood pressure management",
        precautions: "Monitor for dry cough and kidney function"
    },
    {
        name: "Atorvastatin",
        interactions: ["Grapefruit juice increases drug levels", "Clarithromycin may cause muscle pain"],
        ayurvedic_alternatives: "Lasuna (Garlic), Guggulu for cholesterol management",
        precautions: "Monitor liver enzymes and report unexplained muscle pain"
    },
    {
        name: "Amoxicillin",
        interactions: ["Methotrexate levels may increase", "Oral contraceptives may be less effective"],
        ayurvedic_alternatives: "Nimba (Neem), Tulsi (Holy Basil) for natural antimicrobial support",
        precautions: "Check for penicillin allergy; complete the full course"
    },
    {
        name: "Amlodipine",
        interactions: ["Simvastatin levels may increase", "Sildenafil may cause excessive BP drop"],
        ayurvedic_alternatives: "Ashwagandha (Stress management), Arjuna (Heart health)",
        precautions: "Monitor for ankle swelling and dizziness"
    },
    {
        name: "Levothyroxine",
        interactions: ["Calcium/Iron supplements decrease absorption", "Soy products may interfere"],
        ayurvedic_alternatives: "Kanchanar Guggulu (Thyroid support)",
        precautions: "Take on empty stomach, 30-60 minutes before breakfast"
    },
    {
        name: "Albuterol",
        interactions: ["Beta-blockers may negate effect", "Diuretics may increase risk of low potassium"],
        ayurvedic_alternatives: "Vasaka (Adhatoda vasica), Tulsi for respiratory support",
        precautions: "May cause jitteriness and increased heart rate"
    },
    {
        name: "Gabapentin",
        interactions: ["Antacids (take 2 hours apart)", "Opioids increase risk of respiratory depression"],
        ayurvedic_alternatives: "Ashwagandha, Brahmi (Bacopa monnieri) for nerve health",
        precautions: "May cause drowsiness; avoid alcohol"
    },
    // Oncology
    {
        name: "Tamoxifen",
        interactions: ["SSRI antidepressants (Fluoxetine, Paroxetine) decrease effectiveness", "Warfarin increases bleeding risk"],
        ayurvedic_alternatives: "Kanchanar Guggulu (Glandular support), Shatavari (Hormonal balance)",
        precautions: "Monitor for blood clots and vision changes"
    },
    {
        name: "Methotrexate",
        interactions: ["NSAIDs/Aspirin increase toxicity risk", "Alcohol increases liver damage risk", "Folic acid interferes (though often prescribed together)"],
        ayurvedic_alternatives: "Amrita (Guduchi) for immune support, Nimba for blood purification",
        precautions: "Monitor liver and kidney function; avoid sun exposure"
    },
    {
        name: "Cyclophosphamide",
        interactions: ["Allopurinol increases toxicity", "Digoxin levels may decrease"],
        ayurvedic_alternatives: "Tulsi (Immune support), Ashwagandha (Vitality)",
        precautions: "Maintain high fluid intake to prevent bladder irritation"
    },
    // Neurology
    {
        name: "Donepezil",
        interactions: ["Anticholinergics (Benadryl) reduce effectiveness", "NSAIDs increase gastric ulcer risk"],
        ayurvedic_alternatives: "Brahmi, Shankhpushpi (Convolvulus pluricaulis) for cognitive support",
        precautions: "May cause bradycardia (slow heart rate) and fainting"
    },
    {
        name: "Levetiracetam",
        interactions: ["Avoid other CNS depressants", "Minimal drug-drug interactions compared to other AEDs"],
        ayurvedic_alternatives: "Ashwagandha, Jatamansi (Nardostachys jatamansi) for nervous system stability",
        precautions: "Monitor for mood changes or suicidal thoughts"
    },
    {
        name: "Phenytoin",
        interactions: ["Warfarin increases bleeding risk", "Oral contraceptives become less effective", "Alcohol affects drug levels"],
        ayurvedic_alternatives: "Brahmi, Shankhpushpi",
        precautions: "Requires regular blood level monitoring; may cause gum swelling"
    },
    {
        name: "Sumatriptan",
        interactions: ["SSRIs/SNRIs increase risk of Serotonin Syndrome", "MAOIs increase drug levels"],
        ayurvedic_alternatives: "Shunti (Ginger) for migraine, Peppermint oil (externally)",
        precautions: "Contraindicated in patients with heart disease or uncontrolled hypertension"
    }
];

const Fuse = require('fuse.js');

/**
 * Searches the local knowledge base for drug-related information using advanced fuzzy search.
 * @param {string} query The drug name or symptom to search for.
 * @returns {string} Combined context found in the knowledge base.
 */
function searchKnowledgeBase(query) {
    if (!query) return "";

    const fuseOptions = {
        keys: [
            { name: 'name', weight: 0.7 },
            { name: 'interactions', weight: 0.3 }
        ],
        threshold: 0.4, // Threshold for fuzzy match (0.0 is perfect, 1.0 is anything)
        minMatchCharLength: 3
    };

    const fuse = new Fuse(drugKnowledge, fuseOptions);
    const results = fuse.search(query);

    if (results.length === 0) return "";

    // Take top 3 most relevant results
    return results.slice(0, 3).map(result => {
        const r = result.item;
        return `
Drug: ${r.name} (Match Score: ${((1 - result.score) * 100).toFixed(0)}%)
Interactions: ${r.interactions.join(", ")}
Ayurvedic Alternatives: ${r.ayurvedic_alternatives}
Precautions: ${r.precautions}
  `;
    }).join("\n---\n");
}

module.exports = { searchKnowledgeBase };
