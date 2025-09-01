# Backend Server

This is the backend server for the ADR Analysis application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your GitHub API token:
```
GITHUB_TOKEN=your_github_token_here
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## Endpoints

- `POST /api/ai-assistant` - AI chat assistant
- `POST /api/assess-risk` - Medication risk assessment with FDA API integration

## FDA API Integration

The backend integrates with the FDA Adverse Event Reporting System (FAERS) API to provide real-world adverse event data for medications.

### Recent Fixes & Improvements

- **Missing Dependencies**: Added `form-data` package to handle form data in requests
- **Error Handling**: Improved error handling and input validation in FDA API calls
- **Logging**: Added better logging for debugging FDA API issues
- **Drug Name Mapping**: Added international drug name mappings (e.g., paracetamol → acetaminophen)
- **Multiple Search Strategies**: Implemented 5 different search strategies to improve FDA API success rate
- **Fallback System**: Added fallback adverse events for common drugs when FDA API doesn't find matches

### Drug Name Mappings

The system automatically maps common international drug names to their FDA-recognized equivalents:

- `paracetamol` → `acetaminophen`
- `tylenol` → `acetaminophen`
- `advil` → `ibuprofen`
- `motrin` → `ibuprofen`
- `lipitor` → `atorvastatin`
- `prilosec` → `omeprazole`
- `zithromax` → `azithromycin`

### Search Strategies

The FDA API uses multiple search strategies in order:

1. Exact match with generic and brand names
2. Partial match with generic name only
3. Partial match with brand name only
4. Broader search with wildcards
5. Search in substance names
6. Fallback to predefined adverse events

### FDA API Key

The FDA API key is configured in `fda-api.js`. The current key is valid and working.

## Troubleshooting

If you encounter FDA API errors:

1. Check that the backend server is running on port 3001
2. Verify that all dependencies are installed: `npm install`
3. Check the console logs for detailed error messages
4. Ensure the FDA API key is valid and not expired
5. The system will automatically try multiple search strategies and fallbacks

## Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling
- `node-fetch` - HTTP client
- `form-data` - Form data handling
- `dotenv` - Environment variable management
