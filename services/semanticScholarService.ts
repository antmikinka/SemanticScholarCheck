import { Paper } from "../types";

const BASE_URL = "https://api.semanticscholar.org/graph/v1";

// Interfaces specific to API responses
interface S2SearchResponse {
  total: number;
  offset: number;
  data: Paper[];
}

export const searchPapers = async (
  query: string, 
  apiKey?: string
): Promise<Paper[]> => {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  // Fields we want to retrieve
  const fields = "title,year,abstract,citationCount,authors,url,openAccessPdf,publicationVenue";
  
  // Construct URL
  // We limit to 10 results per query to be polite to the public API and keep UI clean
  const targetUrl = `${BASE_URL}/paper/search?query=${encodeURIComponent(query)}&fields=${fields}&limit=10`;

  // ERROR FIX: "Failed to fetch" is typically a CORS error when calling this API from a browser.
  // We use a CORS proxy to bypass browser restrictions for this client-side demo.
  // In a production environment with a backend, you would route this through your server.
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: headers,
    });

    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment or add a Semantic Scholar API key.");
    }

    if (!response.ok) {
      // If the proxy returns a non-200, try to parse details or just throw status
      throw new Error(`Semantic Scholar API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json() as S2SearchResponse;
    return json.data || [];
  } catch (error: any) {
    console.error("Semantic Scholar Search Error:", error);
    
    if (error.message === "Failed to fetch") {
       throw new Error("Network Error (CORS). The browser blocked the request. The CORS proxy may be unreachable.");
    }

    throw error;
  }
};
