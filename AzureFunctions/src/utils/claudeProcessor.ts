import Anthropic from "@anthropic-ai/sdk";
import { ReceiptItem, ReceiptLineItems } from "../types/receipt";
import { uniqueKey } from "./uniqueKey";
import { InvocationContext } from "@azure/functions";

/**
 * @fileoverview Receipt image processing utilities using Claude AI (Anthropic SDK).
 * Provides functions to extract structured receipt data from one or more images
 * using the Claude vision model, sanitize the extracted data, and generate
 * unique receipt identifiers.
 *
 * @module receiptProcessor
 * @requires @anthropic-ai/sdk
 * @requires ../types/receipt
 * @requires ./uniqueKey
 */

/**
 * Anthropic client instance initialised with the API key from environment variables.
 *
 * @type {Anthropic}
 * @see {@link https://docs.anthropic.com/en/api/getting-started}
 */
const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * The exhaustive set of valid category labels that can be assigned to a
 * receipt line item. A value of `null` indicates that no category could
 * be determined from the available product information.
 *
 * @typedef {(
 *   "Appliance & HVAC" |
 *   "Building Materials" |
 *   "Cabinets" |
 *   "Doors" |
 *   "Electrical" |
 *   "Lumber" |
 *   "Paint" |
 *   "Plumbing" |
 *   "Supplies" |
 *   "Windows" |
 *   null
 * )} LineItemCategory
 */
type LineItemCategory =
    | "Appliance & HVAC"
    | "Building Materials"
    | "Cabinets"
    | "Doors"
    | "Electrical"
    | "Lumber"
    | "Paint"
    | "Plumbing"
    | "Supplies"
    | "Windows"
    | null;

/**
 * The complete list of valid category strings used both as the source of
 * truth for {@link LineItemCategory} and for runtime validation inside
 * {@link sanitizeReceiptData}.
 *
 * @constant {ReadonlyArray<NonNullable<LineItemCategory>>}
 */
const VALID_CATEGORIES: ReadonlyArray<NonNullable<LineItemCategory>> = [
    "Appliance & HVAC",
    "Building Materials",
    "Cabinets",
    "Doors",
    "Electrical",
    "Lumber",
    "Paint",
    "Plumbing",
    "Supplies",
    "Windows",
] as const;

/**
 * System prompt used to instruct Claude on how to extract structured data
 * from receipt images.
 *
 * Instructs the model to:
 * - Consolidate data across multiple images belonging to the same receipt
 * - Detect PO / Purchase Order / Job / Job Name references for the `po` field
 * - Assign a `category` to every line item from a fixed vocabulary
 * - Return a strictly typed JSON object with no additional markdown or explanation
 * - Follow field-level guidance for every property in the response schema
 *
 * @constant {string}
 */
const RECEIPT_EXTRACTION_PROMPT = `You are a receipt data extraction assistant. Analyze the provided receipt image(s) and extract all relevant information.

A single receipt may span multiple images. Extract and consolidate all information into a single receipt object.

Return ONLY a valid JSON object with the following structure (no markdown, no explanation):
{
    "date": "YYYY-MM-DD format if available, otherwise empty string",
    "deliver": false,
    "dimensions": false,
    "feature": false,
    "guarantee": false,
    "line_items": [
        {
            "sku_or_upc": "product SKU or UPC if visible, otherwise empty string",
            "name": "product name",
            "serial": "serial number",
            "mfg": null,
            "make": null,
            "model": null,
            "unit_price": 0.00,
            "quantity": 1,
            "total_price": 0.00,
            "category": null
        }
    ],
    "po": "purchase order or job reference if visible, otherwise empty string",
    "product": false,
    "qty": 0,
    "receipt_number": "receipt or transaction number if visible, otherwise empty string",
    "receipt_total": 0.00,
    "reconciled": {
        "by": null,
        "date": null,
        "done": false
    },
    "supplier": "store or supplier name",
    "total_tax": 0.00
}

Field guidance:
- "date": Extract the purchase/transaction date in YYYY-MM-DD format
- "deliver": true if the receipt indicates a delivery order, false otherwise
- "dimensions": true if any products have dimension specifications listed
- "feature": true if any promotional features or special offers are noted
- "guarantee": true if any warranty or guarantee information is present
- "po": Look for any label such as "PO", "PO#", "P.O.", "Purchase Order", "Job", "Job Name", "Job #", or "Job No" and extract the associated reference value. Use an empty string if none is found.
- "product": true if this is a product purchase (vs service), false for service-only receipts
- "qty": total number of individual items purchased (sum of all line item quantities)
- "receipt_number": the receipt, invoice, or transaction ID number
- "receipt_total": the final total amount charged
- "supplier": the business name/vendor
- "total_tax": total tax amount shown on receipt
- "line_items": array of each product/service purchased
  - "sku_or_upc": any product code, SKU, UPC, or barcode number shown
  - "serial": any serial number shown
  - "mfg": the manufacturer
  - "make": the brand or type
  - "model": any model shown
  - "unit_price": price per single unit
  - "quantity": number of units purchased
  - "total_price": unit_price * quantity
  - "category": classify the line item into exactly one of the following categories, or null if none apply:
      "Appliance & HVAC"  - appliances, heating, ventilation, air conditioning, refrigeration units, kitchen appliances, laundry appliances, water heater
      "Building Materials" - concrete, drywall, insulation, roofing, siding, masonry, fasteners, general hardware, fence, flooring, landscape
      "Cabinets"          - kitchen cabinets, bathroom vanities, shelving units, cabinet hardware
      "Doors"             - interior doors, exterior doors, garage doors, door frames, door hardware, closet, garage
      "Electrical"        - boxes, fittings, wiring, outlets, switches, breakers, conduit, lighting fixtures, electrical panels
      "Lumber"            - dimensional lumber, plywood, OSB, engineered wood, timber, decking boards, molding, poles and rods, sheating, shelving, truss, treated lumber
      "Paint"             - paint, primer, stain, varnish, painting tools and supplies
      "Plumbing"          - pipes, fittings, faucets, toilets, valves, drain components, water meter
      "Supplies"          - tools, safety equipment, consumables, cleaning products, adhesives, caulk
      "Windows"           - windows, skylights, window frames, window hardware, window treatments

Return ONLY the JSON object, no other text.`;

/**
 * Validates whether a given string is a well-formed HTTP or HTTPS URL.
 *
 * Uses the built-in {@link URL} constructor for parsing and restricts
 * accepted protocols to `http:` and `https:` only.
 *
 * @param {string} url - The URL string to validate.
 * @returns {boolean} `true` if the string is a valid HTTP/HTTPS URL, `false` otherwise.
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
 * Processes one or more receipt images using the Claude vision model and
 * returns structured receipt data extracted from the image content.
 *
 * A single receipt may span multiple images (e.g. front and back, or
 * multiple pages). When more than one URL is supplied the prompt instructs
 * Claude to consolidate all images into a single receipt object.
 *
 * Processing pipeline:
 * 1. Validates that at least one URL has been provided.
 * 2. Validates that every URL is a well-formed HTTP/HTTPS URL.
 * 3. Builds an Anthropic multimodal message containing each image followed
 *    by the extraction prompt.
 * 4. Sends the message to `claude-opus-4-5` with a 4096-token budget.
 * 5. Extracts and concatenates all text blocks from the response.
 * 6. Strips any accidental markdown code fences and parses the JSON payload.
 * 7. Sanitises every field via {@link sanitizeReceiptData} before returning.
 *
 * @async
 * @function processReceiptImages
 * @param {string[]} imageUrls - An array of publicly accessible HTTP/HTTPS image URLs
 *   pointing to receipt images. All URLs must resolve to the **same** receipt.
 * @param {InvocationContext} context - The Azure Functions invocation context used
 *   for structured logging throughout the processing pipeline.
 * @returns {Promise<Omit<ReceiptItem, "_id" | "images">>} A promise that resolves to
 *   a sanitised receipt data object. The `_id` and `images` fields are intentionally
 *   excluded as they are managed by the calling layer.
 *
 * @throws {Error} If `imageUrls` is empty or not provided –
 *   _"No image URLs provided for processing"_
 * @throws {Error} If any entry in `imageUrls` fails URL validation –
 *   _"Invalid image URL: \<url\>"_
 * @throws {Error} If Claude's response cannot be parsed as valid JSON –
 *   _"Failed to parse Claude response as JSON: \<raw response\>"_
 *
 * @example
 * // Single-image receipt
 * const receipt = await processReceiptImages([
 *     "https://storage.example.com/receipts/receipt-001.jpg",
 * ], context);
 * console.log(receipt.supplier);      // "Whole Foods Market"
 * console.log(receipt.receipt_total); // 42.99
 * console.log(receipt.po);            // "JOB-2024-001"
 *
 * @example
 * // Multi-image receipt (two pages)
 * const receipt = await processReceiptImages([
 *     "https://storage.example.com/receipts/receipt-002-p1.jpg",
 *     "https://storage.example.com/receipts/receipt-002-p2.jpg",
 * ], context);
 * console.log(receipt.line_items.length);         // items consolidated from both pages
 * console.log(receipt.line_items[0].category);    // "Lumber"
 */
export async function processReceiptImages(
    imageUrls: string[],
    context: InvocationContext
): Promise<Omit<ReceiptItem, "_id" | "images">> {
    if (!imageUrls || imageUrls.length === 0) {
        throw new Error("No image URLs provided for processing");
    }

    for (const url of imageUrls) {
        if (!isValidUrl(url)) {
            throw new Error(`Invalid image URL: ${url}`);
        }
    }

    // Build the content array with all image URLs for Claude
    const imageContent: Anthropic.ImageBlockParam[] = imageUrls.map((url) => ({
        type: "image" as const,
        source: {
            type: "url",
            url,
        } as Anthropic.URLImageSource,
    }));

    context.log("imageContent", imageContent);

    const message = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 4096,
        messages: [
            {
                role: "user",
                content: [
                    ...imageContent,
                    {
                        type: "text",
                        text:
                            imageUrls.length > 1
                                ? `These ${imageUrls.length} images all belong to the same receipt. ${RECEIPT_EXTRACTION_PROMPT}`
                                : RECEIPT_EXTRACTION_PROMPT,
                    },
                ],
            },
        ],
    });

    context.log("message", message);

    // Extract text content from the response
    const responseText = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

    context.log("response", responseText);

    // Parse the JSON response
    let extractedData: Omit<ReceiptItem, "_id" | "images">;
    try {
        const cleanedResponse = responseText
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        extractedData = JSON.parse(cleanedResponse);
    } catch {
        throw new Error(
            `Failed to parse Claude response as JSON: ${responseText}`
        );
    }

    return sanitizeReceiptData(extractedData);
}

/**
 * Coerces a raw category value returned by Claude into a valid
 * {@link LineItemCategory}, returning `null` for any value that does not
 * exactly match one of the members of {@link VALID_CATEGORIES}.
 *
 * The comparison is **case-insensitive** and trims surrounding whitespace so
 * that minor formatting differences in Claude's output do not produce spurious
 * `null` results.
 *
 * @function sanitizeCategory
 * @param {unknown} raw - The raw category value to coerce. Accepts any type;
 *   non-string values are unconditionally mapped to `null`.
 * @returns {LineItemCategory} A validated category string, or `null`.
 *
 * @example
 * sanitizeCategory("Lumber");          // "Lumber"
 * sanitizeCategory("lumber");          // "Lumber"
 * sanitizeCategory("  Electrical  ");  // "Electrical"
 * sanitizeCategory("Furniture");       // null
 * sanitizeCategory(null);              // null
 * sanitizeCategory(42);               // null
 */
function sanitizeCategory(raw: unknown): LineItemCategory {
    if (typeof raw !== "string") return null;

    const normalised = raw.trim().toLowerCase();

    const match = VALID_CATEGORIES.find(
        (cat) => cat.toLowerCase() === normalised
    );

    return match ?? null;
}

/**
 * Sanitises and normalises raw receipt data returned by Claude, coercing every
 * field to its expected type and substituting safe defaults for missing values.
 *
 * Sanitisation rules applied per field:
 * - **String fields** (`date`, `po`, `receipt_number`, `supplier`,
 *   `sku_or_upc`, `name`) – cast via `String()`, falling back to an empty
 *   string or a descriptive placeholder where appropriate.
 * - **Boolean fields** (`deliver`, `dimensions`, `feature`, `guarantee`,
 *   `product`, `reconciled.done`) – cast via `Boolean()`.
 * - **Numeric fields** (`unit_price`, `total_price`, `receipt_total`,
 *   `total_tax`) – parsed with `parseFloat()`, defaulting to `0` on failure.
 * - **Integer fields** (`quantity`, `qty`) – parsed with `parseInt(..., 10)`,
 *   defaulting to `1` (quantity) or `0` (qty) on failure.
 * - **`qty`** – recalculated as the sum of all sanitised line-item quantities
 *   when at least one line item exists, otherwise falls back to the raw `qty`
 *   value supplied by Claude.
 * - **`category`** – validated against {@link VALID_CATEGORIES} via
 *   {@link sanitizeCategory}; set to `null` when no match is found.
 * - **`reconciled`** – `by` and `date` default to `null`; `done` defaults to
 *   `false`.
 *
 * @function sanitizeReceiptData
 * @param {Partial<ReceiptItem>} data - The raw (potentially incomplete or
 *   incorrectly typed) receipt object returned by Claude.
 * @returns {Omit<ReceiptItem, "_id" | "images">} A fully populated, type-safe
 *   receipt data object ready for persistence or further processing.
 *
 * @example
 * const raw = {
 *     supplier: 123,
 *     receipt_total: "29.99",
 *     po: "JOB-2024-042",
 *     line_items: [{ name: "2x4 Stud", category: "lumber", quantity: 10, unit_price: 3.50, total_price: 35.00 }],
 * };
 * const clean = sanitizeReceiptData(raw as Partial<ReceiptItem>);
 * console.log(clean.supplier);                    // "123"
 * console.log(clean.receipt_total);               // 29.99
 * console.log(clean.po);                          // "JOB-2024-042"
 * console.log(clean.line_items[0].category);      // "Lumber"
 */
function sanitizeReceiptData(
    data: Partial<ReceiptItem>
): Omit<ReceiptItem, "_id" | "images"> {
    const sanitizedLineItems: ReceiptLineItems[] = (
        data.line_items || []
    ).map((item) => ({
        sku_or_upc: String(item.sku_or_upc || ""),
        name: String(item.name || "Unknown Item"),
        unit_price: parseFloat(String(item.unit_price || 0)) || 0,
        quantity: parseInt(String(item.quantity || 1), 10) || 1,
        total_price: parseFloat(String(item.total_price || 0)) || 0,
        category: sanitizeCategory(item.category),
        serial: item.serial,
        mfg: item.mfg,
        make: item.make,
        model: item.model
    }));

    const totalQty =
        sanitizedLineItems.length > 0
            ? sanitizedLineItems.reduce((sum, item) => sum + item.quantity, 0)
            : parseInt(String(data.qty || 0), 10) || 0;

    return {
        date: String(data.date || ""),
        deliver: Boolean(data.deliver),
        dimensions: Boolean(data.dimensions),
        feature: Boolean(data.feature),
        guarantee: Boolean(data.guarantee),
        line_items: sanitizedLineItems,
        po: String(data.po || ""),
        product: Boolean(data.product),
        qty: totalQty,
        receipt_number: String(data.receipt_number || ""),
        receipt_total: parseFloat(String(data.receipt_total || 0)) || 0,
        reconciled: {
            by: data.reconciled?.by ?? null,
            date: data.reconciled?.date ?? null,
            done: Boolean(data.reconciled?.done),
        },
        supplier: String(data.supplier || "Unknown Supplier"),
        total_tax: parseFloat(String(data.total_tax || 0)) || 0,
    };
}

/**
 * Generates a unique string identifier suitable for use as a receipt ID.
 *
 * Delegates to {@link uniqueKey} and converts the result to a string,
 * providing a thin, consistently typed wrapper for the rest of the
 * application to consume.
 *
 * @function generateReceiptId
 * @returns {string} A unique string identifier for a receipt document.
 *
 * @example
 * const id = generateReceiptId();
 * console.log(typeof id); // "string"
 * console.log(id.length); // depends on uniqueKey implementation
 */
export function generateReceiptId(): string {
    return uniqueKey().toString();
}
