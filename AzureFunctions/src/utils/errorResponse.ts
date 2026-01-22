import { HttpResponseInit } from "@azure/functions";

/**
 * Sends a JSON error HTTP response.
 * @param {number} status - HTTP status code.
 * @param {string} error - Error message.
 * @returns {HttpResponseInit} HTTP response object.
 */
export function errorResponse(status: number, error: string): HttpResponseInit {
    return {
        status,
        body: JSON.stringify({ data: [], error }),
    };
}