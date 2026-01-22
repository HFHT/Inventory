import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { MongoClient, ClientSession, MongoError } from "mongodb";
import { allStrings, errorResponse, hasTransferSelectsProps } from "../utils";
import { BillOfMaterial, Inventory, InventoryDbType, InventoryLocation, ParcelInventoryType } from "../types";

/**
 * @typedef {Object} TransferSelects
 * @property {string} controllingDB - The main collection/database to operate on.
 * @property {string} locationOfInventory - The location (e.g., warehouse) from which inventory is transferred.
 * @property {string} locationOfParcel - The destination location (e.g., another warehouse or parcel/construction site).
 * @property {string} parcel - The Parcel ID, if relevant.
 */
/**
 * @type {TransferSelects}
 */
export type TransferSelects = {
    controllingDB: string;
    locationOfInventory: string;
    locationOfParcel: string;
    parcel: string;
};

/**
 * @typedef {Object} RowSelection
 * @property {string} parcel - The parcel identifier for this row selection.
 * @property {number} amount - The quantity to transfer for this line item.
 */
/**
 * @type {RowSelection}
 */
export type RowSelection = {
    parcel: string;
    amount: number;
};

/**
 * @typedef {Object<string, RowSelection>} RowSelections
 * Stores row selections by row ID. Example: { [rowId]: { parcel, amount } }
 */
/**
 * @type {RowSelections}
 */
export type RowSelections = Record<string, RowSelection>;


/**
 * Azure Function HTTP handler for transferring inventory items between locations.
 *
 * Handles transfers between warehouses, or from a warehouse to a parcel's BOM (Bill of Materials).
 *
 * - For warehouse-to-warehouse: adjusts the `quantity.byLocation` fields.
 * - For warehouse-to-parcel: adjusts both the warehouse qty out, and the receiving parcel's BOM entry.
 *
 * @param {HttpRequest} request - Azure HTTP request object.
 * @param {InvocationContext} context - Azure Invocation context for logging/errors.
 * @returns {Promise<HttpResponseInit>} Resolves with HTTP response object.
 *
 * @throws {500} Unknown or database error.
 */
export async function transferItems(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    // Ensure D.B connection string exists
    if (!process.env || !process.env.ATLAS_URI) {
        return errorResponse(501, "Missing Environment Variable.");
    }

    let client: MongoClient | null = null;

    try {
        // Validate request method
        if (request.method !== "PUT" && request.method !== "POST") {
            return errorResponse(405, "Invalid method.");
        }

        /**
         * @type {{ controls: TransferSelects, items: RowSelections }}
         */
        let req: { controls: TransferSelects; items: RowSelections };
        try {
            req = (await request.json()) as { controls: TransferSelects; items: RowSelections };
        } catch (e) {
            return errorResponse(400, "Malformed JSON body.");
        }

        const { controls, items } = req;

        // Validate controls and items structure
        if (!controls || !hasTransferSelectsProps(controls) || !allStrings(controls)) {
            return errorResponse(400, "Invalid controls property.");
        }
        if (!items || typeof items !== "object" || Object.keys(items).length === 0) {
            return errorResponse(400, "No items provided for transfer.");
        }

        client = new MongoClient(process.env.ATLAS_URI);
        await client.connect();

        // Fetch location data from Settings._Locations
        /**
         * @type {import("../types").InventoryDbType}
         */
        const locationsCol = client.db("Settings").collection<InventoryDbType>("_Locations");
        const _locations = await locationsCol.findOne();
        if (!_locations?.Locations) {
            context.error("Unable to find Locations in DB.");
            return errorResponse(500, "Server error retrieving locations.");
        }

        const location = _locations.Locations.find(
            (l: InventoryLocation) => l.Name === controls.locationOfParcel
        );
        if (!location) {
            context.error(`Location "${controls.locationOfParcel}" not found.`);
            return errorResponse(404, `Location "${controls.locationOfParcel}" not found.`);
        }

        const isWarehouse = !!location.Org;
        context.log("warehouse", isWarehouse);

        /** @type {any[]} */
        const results: any[] = [];

        // Iterate over each inventory item to transfer
        for (const [rowId, rowSelection] of Object.entries(items)) {
            /** Validate transfer amount. */
            if (!rowSelection.amount || typeof rowSelection.amount !== "number" ) {
                context.log(`Invalid amount for rowId ${rowId}`);
                results.push({ rowId, status: "skipped", reason: "Invalid amount" });
                continue;
            }

            const inventoryId = Number(rowId);
            if (isNaN(inventoryId)) {
                context.log(`Invalid inventory ID: ${rowId}`);
                results.push({ rowId, status: "skipped", reason: "Invalid inventory ID" });
                continue;
            }

            try {
                // Lookup inventory item by ID
                const inventoryCol = client.db("Construction").collection<Inventory>("Inventory");
                const inventoryItem = await inventoryCol.findOne({ _id: inventoryId });
                if (!inventoryItem) {
                    context.log(`Inventory item not found: ${rowId}`);
                    results.push({ rowId, status: "skipped", reason: "Inventory item not found" });
                    continue;
                }

                if (isWarehouse) {
                    // --- Warehouse transfer (updates only locations in Inventory) ---
                    /** @type {import("mongodb").UpdateResult} */
                    const updateRes = await inventoryCol.updateOne(
                        { _id: inventoryId },
                        {
                            $inc: {
                                "quantity.byLocation.$[from].qty": -rowSelection.amount,
                                "quantity.byLocation.$[to].qty": rowSelection.amount,
                            }
                        },
                        {
                            arrayFilters: [
                                { "from.loc": controls.locationOfInventory },
                                { "to.loc": controls.locationOfParcel }
                            ]
                        }
                    );
                    results.push({
                        rowId,
                        status: "updated",
                        matched: updateRes.matchedCount,
                        modified: updateRes.modifiedCount
                    });
                } else {
                    // --- Parcel transfer (update BillOfMaterial, adjust warehouse quantities) ---
                    /**
                     * @type {import("mongodb").Collection<ParcelInventoryType>}
                     */
                    const parcelCol = client.db("Homes").collection<ParcelInventoryType>("ParcelInventory");
                    /**
                     * @type {ParcelInventoryType|null}
                     */
                    const parcel = await parcelCol.findOne({
                        subdivision_id: controls.locationOfParcel,
                        parcelLot: rowSelection.parcel,
                    });

                    if (!parcel) {
                        context.log(`Parcel not found for rowId ${rowId}`, rowSelection);
                        results.push({ rowId, status: "skipped", reason: "Parcel not found" });
                        continue;
                    }

                    /** @type {ClientSession} */
                    const session = client.startSession();
                    try {
                        // Run both BOM/inventory updates atomically.
                        await session.withTransaction(async () => {
                            // Check if item already exists in parcel's billOfMaterial
                            const itemIdx = parcel.billOfMaterial.findIndex(
                                (b) => b.inventory_id === inventoryId
                            );
                            if (itemIdx >= 0) {
                                // Update existing BOM item actual amount
                                const bomRes = await parcelCol.updateOne(
                                    { _id: parcel._id, "billOfMaterial.inventory_id": inventoryId },
                                    { $inc: { "billOfMaterial.$.actual": rowSelection.amount } },
                                    { session }
                                );

                                const inventoryRes = await inventoryCol.updateOne(
                                    { _id: inventoryId, "quantity.byLocation.loc": controls.locationOfInventory },
                                    {
                                        $inc: {
                                            "quantity.total": -rowSelection.amount,
                                            "quantity.byLocation.$.qty": -rowSelection.amount,
                                        }
                                    },
                                    { session }
                                );

                                results.push({
                                    rowId,
                                    status: "parcel-updated-existing",
                                    bom: bomRes.modifiedCount,
                                    inventory: inventoryRes.modifiedCount
                                });
                            } else {
                                // Create new BOM entry for this parcel
                                const newBillOfMaterial: BillOfMaterial = {
                                    inventory_id: inventoryId,
                                    title: inventoryItem.title,
                                    category: inventoryItem.select.category,
                                    subCategory: inventoryItem.select.subCategory,
                                    required: null,
                                    actual: rowSelection.amount,
                                };
                                const bomRes = await parcelCol.updateOne(
                                    { _id: parcel._id },
                                    { $push: { billOfMaterial: newBillOfMaterial } },
                                    { session }
                                );
                                const inventoryRes = await inventoryCol.updateOne(
                                    { _id: inventoryId, "quantity.byLocation.loc": controls.locationOfInventory },
                                    {
                                        $inc: {
                                            "quantity.total": -rowSelection.amount,
                                            "quantity.byLocation.$.qty": -rowSelection.amount,
                                        }
                                    },
                                    { session }
                                );
                                results.push({
                                    rowId,
                                    status: "parcel-added-new",
                                    bom: bomRes.modifiedCount,
                                    inventory: inventoryRes.modifiedCount
                                });
                            }
                        });
                    } catch (error) {
                        context.log("Transaction error:", error);
                        results.push({ rowId, status: "error", error: error instanceof Error ? error.message : error });
                    } finally {
                        await session.endSession();
                    }
                }
            } catch (err) {
                context.log(`Error processing rowId ${rowId}:`, err);
                results.push({ rowId, status: "error", error: err instanceof Error ? err.message : err });
            }
        }

        // Return up-to-date data
        const data = await client.db("Construction").collection(controls.controllingDB).find().toArray();
        return {
            status: 200,
            body: JSON.stringify({ data, result: results }),
        };

    } catch (error) {
        // General catch-all error
        context.error(error);
        let message = "Unknown error";
        if (error instanceof MongoError) {
            message = `Database Error: ${error.message}`;
        } else if (error instanceof Error) {
            message = error.message;
        }
        return errorResponse(500, message);
    } finally {
        if (client) await client.close();
    }
}

/**
 * Azure HTTP endpoint registration for transferItems.
 */
app.http("transferItems", {
    methods: ["PUT", "POST"],
    authLevel: "anonymous",
    handler: transferItems,
});