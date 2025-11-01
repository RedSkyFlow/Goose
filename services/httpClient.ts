// This file acts as a central point for making HTTP requests.
// By default, it uses the browser's native fetch, but it can be
// overridden by the mock API for development and testing.

// Original fetch function to be bound and potentially restored.
const originalFetch = window.fetch.bind(window);

const enhancedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
        const response = await originalFetch(input, init);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => 'Could not read error body.');
            // Create a more informative error message
            const errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}. URL: ${response.url}. Body: ${errorBody}`;
            throw new Error(errorMessage);
        }

        return response;
    } catch (error) {
        console.error("Fetch API Error:", error);
        // Re-throw the error so that the calling code can handle it
        throw error;
    }
};

export const http = {
  fetch: enhancedFetch,
};