/**
 * Fetch wrapper for Fetch API, with error handling.
 * 
 * @template T - The expected response data type.
 * @param {RequestInfo} url - The resource that you wish to fetch.
 * @param {RequestInit} [init] - An object containing custom settings to apply to the request.
 * @returns {Promise<Response>} Promise resolving to the Response containing the API data.
 * @throws {Error} Throws if HTTP response is not OK.
 */
export async function handleFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    const res = await fetch(url, init);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
}