/**
 * Helper to fetch a resource with a timeout.
 * Automatically aborts the request using AbortController if it takes too long.
 */
export function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 3000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(id);
      return response;
    })
    .catch((error) => {
      clearTimeout(id);
      throw error;
    });
}
