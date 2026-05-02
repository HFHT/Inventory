import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext,
} from "@azure/functions";
import {
    processReceiptImages,
    generateReceiptId,
} from "../utils/claudeProcessor";
import { ReceiptItem, ReceiptItems } from "../types/receipt";

/**
 * @typedef {Object} ReceiptRequestBody
 * @property {ReceiptRequest[]} receipts - Array of receipt requests to be processed
 */
interface ReceiptRequestBody {
    receipts: ReceiptRequest[];
}

/**
 * @typedef {Object} ReceiptRequest
 * @property {string[]} image_urls - Array of image URLs for a single receipt (max 10)
 */
interface ReceiptRequest {
    image_urls: string[];
}

/**
 * @typedef {Object} ProcessingError
 * @property {number} receiptIndex - The 1-based index of the receipt that failed
 * @property {string} error - The error message describing the failure
 */

/**
 * @typedef {Object} ProcessReceiptResponse
 * @property {boolean} success - Whether at least one receipt was processed successfully
 * @property {number} processed - Number of successfully processed receipts
 * @property {number} failed - Number of failed receipt processing attempts
 * @property {ReceiptItems} receipts - Array of successfully processed receipt items
 * @property {ProcessingError[]} [errors] - Optional array of errors for failed receipts
 */

/**
 * Maximum number of image URLs allowed per individual receipt request.
 * @constant {number}
 */
const MAX_IMAGES_PER_RECEIPT = 10;

/**
 * Maximum number of receipts allowed in a single HTTP request.
 * @constant {number}
 */
const MAX_RECEIPTS_PER_REQUEST = 5;

/**
 * Validates whether a given string is a valid HTTP or HTTPS URL.
 *
 * @param {string} url - The URL string to validate
 * @returns {boolean} `true` if the URL is a valid http/https URL, `false` otherwise
 *
 * @example
 * isValidUrl("https://example.com/receipt.jpg"); // true
 * isValidUrl("ftp://example.com/file.txt");       // false
 * isValidUrl("not-a-url");                        // false
 */
function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Validates the incoming receipt request body against defined business rules.
 *
 * Validation rules enforced:
 * - `receipts` must be a non-empty array
 * - Number of receipts must not exceed {@link MAX_RECEIPTS_PER_REQUEST}
 * - Each receipt must contain a non-empty `image_urls` array
 * - Number of image URLs per receipt must not exceed {@link MAX_IMAGES_PER_RECEIPT}
 * - Each URL must be a non-empty string and a valid http/https URL
 *
 * @param {ReceiptRequestBody} body - The parsed request body to validate
 * @returns {string | null} An error message string if validation fails, or `null` if valid
 *
 * @example
 * const error = validateRequest({
 *   receipts: [{ image_urls: ["https://example.com/receipt.jpg"] }]
 * });
 * if (error) console.error(error); // null - valid request
 */
function validateRequest(body: ReceiptRequestBody): string | null {
    if (!body.receipts || !Array.isArray(body.receipts)) {
        return "Request body must contain a 'receipts' array";
    }

    if (body.receipts.length === 0) {
        return "At least one receipt must be provided";
    }

    if (body.receipts.length > MAX_RECEIPTS_PER_REQUEST) {
        return `Maximum ${MAX_RECEIPTS_PER_REQUEST} receipts allowed per request`;
    }

    for (let i = 0; i < body.receipts.length; i++) {
        const receipt = body.receipts[i];

        if (!receipt.image_urls || !Array.isArray(receipt.image_urls)) {
            return `Receipt ${i + 1}: must contain an 'image_urls' array`;
        }

        if (receipt.image_urls.length === 0) {
            return `Receipt ${i + 1}: must contain at least one image URL`;
        }

        if (receipt.image_urls.length > MAX_IMAGES_PER_RECEIPT) {
            return `Receipt ${i + 1}: maximum ${MAX_IMAGES_PER_RECEIPT} image URLs per receipt`;
        }

        for (let j = 0; j < receipt.image_urls.length; j++) {
            const url = receipt.image_urls[j];

            if (!url || typeof url !== "string") {
                return `Receipt ${i + 1}, URL ${j + 1}: must be a non-empty string`;
            }

            if (!isValidUrl(url)) {
                return `Receipt ${i + 1}, URL ${j + 1}: '${url}' is not a valid http/https URL`;
            }
        }
    }

    return null;
}

/**
 * Azure HTTP Trigger function that processes receipt images using the Claude AI processor.
 *
 * Accepts a POST request containing one or more receipts, each with one or more image URLs.
 * Each receipt's images are sent to the Claude AI processor for data extraction.
 * Successfully processed receipts are returned in the response along with any processing errors.
 *
 * @async
 * @function processReceipt
 * @param {HttpRequest} request - The incoming Azure HTTP request object
 * @param {InvocationContext} context - The Azure Functions invocation context for logging
 * @returns {Promise<HttpResponseInit>} A promise that resolves to an Azure HTTP response object
 *
 * @example
 * // Request body
 * POST /api/receipts/process
 * {
 *   "receipts": [
 *     {
 *       "image_urls": [
 *         "https://storage.example.com/receipt-page1.jpg",
 *         "https://storage.example.com/receipt-page2.jpg"
 *       ]
 *     }
 *   ]
 * }
 *
 * @example
 * // Successful response (HTTP 200)
 * {
 *   "success": true,
 *   "processed": 1,
 *   "failed": 0,
 *   "receipts": [
 *     {
 *       "_id": "rec_abc123",
 *       "supplier": "Acme Corp",
 *       "receipt_total": 42.99,
 *       "images": ["https://storage.example.com/receipt-page1.jpg"]
 *     }
 *   ]
 * }
 *
 * @example
 * // Partial failure response (HTTP 200 with errors)
 * {
 *   "success": true,
 *   "processed": 1,
 *   "failed": 1,
 *   "receipts": [...],
 *   "errors": [{ "receiptIndex": 2, "error": "Unable to extract receipt data" }]
 * }
 *
 * @throws Will return HTTP 500 if the ANTHROPIC_API_KEY environment variable is not configured
 * @throws Will return HTTP 400 if the request body is not valid JSON
 * @throws Will return HTTP 400 if request validation fails
 * @throws Will return HTTP 422 if all receipts fail to process
 */
export async function processReceipt(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log("Processing receipt request");

    if (!process.env.ANTHROPIC_API_KEY) {
        context.error("ANTHROPIC_API_KEY environment variable is not set");
        return {
            status: 500,
            jsonBody: {
                error: "Server configuration error",
                message: "API key not configured",
            },
        };
    }

    // Parse request body
    let body: ReceiptRequestBody;
    try {
        body = (await request.json()) as ReceiptRequestBody;
    } catch {
        return {
            status: 400,
            jsonBody: {
                error: "Invalid request body",
                message: "Request body must be valid JSON",
            },
        };
    }

    // Validate request
    const validationError = validateRequest(body);
    if (validationError) {
        return {
            status: 400,
            jsonBody: {
                error: "Validation error",
                message: validationError,
            },
        };
    }

    // Process each receipt
    const results: ReceiptItems = [];
    const errors: { receiptIndex: number; error: string }[] = [];

    for (let i = 0; i < body.receipts.length; i++) {
        const receiptRequest = body.receipts[i];
        context.log(
            `Processing receipt ${i + 1} of ${body.receipts.length} with ${receiptRequest.image_urls.length} image URL(s)`
        );

        try {
            const extractedData = await processReceiptImages(
                receiptRequest.image_urls, context
            );

            const receiptItem: ReceiptItem = {
                _id: generateReceiptId(),
                ...extractedData,
                images: receiptRequest.image_urls,
            };

            results.push(receiptItem);
            context.log(
                `Successfully processed receipt ${i + 1}: ${receiptItem.supplier} - ${receiptItem.receipt_total}`
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            context.error(
                `Failed to process receipt ${i + 1}: ${errorMessage}`
            );
            errors.push({
                receiptIndex: i + 1,
                error: errorMessage,
            });
        }
    }

    if (results.length === 0 && errors.length > 0) {
        return {
            status: 422,
            jsonBody: {
                error: "Processing failed",
                message: "Failed to process all receipts",
                errors,
            },
        };
    }

    return {
        status: 200,
        jsonBody: {
            success: true,
            processed: results.length,
            failed: errors.length,
            receipts: results,
            ...(errors.length > 0 && { errors }),
        },
    };
}

/**
 * Registers the `processReceipt` function as an Azure HTTP trigger.
 *
 * @remarks
 * - **Route**: `receipts/process`
 * - **Method**: `POST`
 * - **Auth Level**: `function` (requires a valid function key in the request)
 *
 * @see {@link processReceipt} for full handler documentation
 */
app.http("processReceipt", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: processReceipt,
});