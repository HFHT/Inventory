/**
 * @fileoverview Service for processing receipt images through the Azure Web App API.
 * Handles receipt-specific validation and delegates fetch operations to claudeApi.
 * @module receiptApi
 */

import { apiFetch } from "./claudeApi";
import type { ApiResponse } from "./claudeApi";

/** Represents a single receipt with one or more image URLs */
export interface Receipt {
  /** Array of image URLs for a single receipt (can be multi-page) */
  image_urls: string[];
}

/** Request payload structure for the receipt processing API */
export interface ReceiptProcessingRequest {
  /** Array of receipts to be processed */
  receipts: Receipt[];
}

/** API endpoint definitions for receipt operations */
const RECEIPT_ENDPOINTS = {
  PROCESS: "/processReceipt",
} as const;

/**
 * Validates the receipts payload before sending to the API
 * @param {ReceiptProcessingRequest} payload - The receipt processing request payload
 * @returns {boolean} Whether the payload is valid
 */
const validateReceiptPayload = (
  payload: ReceiptProcessingRequest
): boolean => {
  if (!payload) {
    console.log("Error: Receipt payload is null or undefined");
    return false;
  }

  if (!Array.isArray(payload.receipts)) {
    console.log("Error: Receipts must be an array");
    return false;
  }

  if (payload.receipts.length === 0) {
    console.log("Error: Receipts array cannot be empty");
    return false;
  }

  for (const [index, receipt] of payload.receipts.entries()) {
    if (!receipt.image_urls || !Array.isArray(receipt.image_urls)) {
      console.log(
        `Error: Receipt at index ${index} must have an image_urls array`
      );
      return false;
    }

    if (receipt.image_urls.length === 0) {
      console.log(
        `Error: Receipt at index ${index} must have at least one image URL`
      );
      return false;
    }

    for (const [urlIndex, url] of receipt.image_urls.entries()) {
      if (typeof url !== "string" || url.trim() === "") {
        console.log(
          `Error: Invalid URL at receipt index ${index}, URL index ${urlIndex}`
        );
        return false;
      }
    }
  }

  return true;
};

/**
 * Sends receipt images to the Azure Web App for processing.
 * Validates the receipt payload before delegating to the generic apiFetch handler.
 * @param {ReceiptProcessingRequest} receipts - The receipts object containing image URLs to process
 * @returns {Promise<ApiResponse | null>} The API response or null if an error occurred
 * @example
 * const response = await processReceipts({
 *   receipts: [
 *     {
 *       image_urls: [
 *         "https://your-storage.blob.core.windows.net/receipts/receipt_page1.jpg",
 *         "https://your-storage.blob.core.windows.net/receipts/receipt_page2.jpg"
 *       ]
 *     }
 *   ]
 * });
 */
export const processReceipts = async (
  receipts: ReceiptProcessingRequest
): Promise<ApiResponse | null> => {
  if (!validateReceiptPayload(receipts)) {
    console.log("Error: Invalid receipt payload, aborting API call");
    return null;
  }

  return apiFetch({
    endpoint: RECEIPT_ENDPOINTS.PROCESS,
    payload: receipts,
  });
};

