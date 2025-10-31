// This file acts as a central point for making HTTP requests.
// By default, it uses the browser's native fetch, but it can be
// overridden by the mock API for development and testing.

export const http = {
  fetch: window.fetch.bind(window),
};
