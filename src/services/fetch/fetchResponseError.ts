/**
 * Extracts error information from a fetch Response, combining HTTP and API-provided details.
 * @param {Response} res - The fetch Response object
 * @param {string} title - The title for the message
 * @returns {Promise<Error>} - An Error containing all relevant info
 */
export async function fetchResponseError(res: Response, title: string): Promise<Error> {
    let message = `${title}: ${res.status} ${res.statusText}`;
    try {
        const data = await res.json();
        if (data?.error) {
            message += ` | API error: ${data.error}`;
        }
    } catch {
        // JSON parse error, ignore
    }
    return new Error(message);
}