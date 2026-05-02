import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { MongoClient, ClientSession, MongoError } from "mongodb";
import { allStrings, errorResponse, hasTransferSelectsProps } from "../utils";
import { BasePallet, BillOfMaterial, Inventory, InventoryDbType, InventoryLocation, ParcelInventoryType } from "../types";

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
    type: 'pallet' | 'inventory';
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

        // if (controls.type === 'pallet') {
        //     return errorResponse(400, "Pallet transfer not implemented.");
        // }
        /**
        * pallet processing, for each pallet 
        * update Pallets collection dateShipped and location
        * update the ParcelInventory collection pallets array
        * - add to parcel 
        * - handle the case where it moves from one parcel to another (remove and add)
        * - handle the case where it is returned to a warehouse (remove from parcel)
        */
        /** Inserted pallet code here. */
        if (controls.type === 'pallet') {
            // 1. Validate body
            if (!items || typeof items !== "object" || Object.keys(items).length === 0) {
                return errorResponse(400, "No pallet items provided for transfer.");
            }
            // 2. Connect
            client = new MongoClient(process.env.ATLAS_URI);
            await client.connect();

            // 3. Collections needed
            const palletCol = client.db("Construction").collection<BasePallet>("Pallets");
            const parcelCol = client.db("Homes").collection<ParcelInventoryType>("ParcelInventory");

            /** @type {any[]} */
            const results: any[] = [];

            for (const [rowId, rowSelection] of Object.entries(items)) {
                let intPalletId = isNaN(Number(rowId)) ? rowId : Number(rowId);

                try {
                    // Find the pallet
                    const pallet = await palletCol.findOne({ _id: intPalletId });
                    if (!pallet) {
                        results.push({ rowId, status: "skipped", reason: "Pallet not found" });
                        continue;
                    }

                    const prevLoc = pallet.location;
                    const destLoc = controls.locationOfParcel;

                    // If destination is a warehouse (warehouse transfer)
                    const locationsCol = client.db("Settings").collection<InventoryDbType>("_Locations");
                    const _locations = await locationsCol.findOne();
                    const locationObj = _locations?.Locations?.find((l: InventoryLocation) => l.Name === destLoc);

                    // Will be true if destination is a warehouse
                    const goingToWarehouse = !!locationObj?.warehouse;

                    // ---- Start Session for transfer actions ----
                    const session = client.startSession();
                    let transferResult: any = { rowId };
                    try {
                        await session.withTransaction(async () => {
                            // 1. Update Pallet main properties
                            const nowIso = new Date().toISOString();
                            const updatePalletFields: Partial<BasePallet> = {
                                dateShipped: nowIso,
                                location: destLoc,
                            };
                            // Remove unloaded date if sending to warehouse, set if arriving @ parcel
                            // if (goingToWarehouse) {
                            //     updatePalletFields.dateUnloaded = "";
                            // } else {
                            //     updatePalletFields.dateUnloaded = nowIso;
                            // }
                            await palletCol.updateOne(
                                { _id: intPalletId },
                                { $set: updatePalletFields },
                                { session }
                            );
                            transferResult.updatedPallet = true;

                            if (!goingToWarehouse) {
                                // Destination is Parcel: Add reference _id to ParcelInventory.pallets array if not present
                                const dstParcel = await parcelCol.findOne({
                                    subdivision_id: destLoc,
                                    parcelLot: rowSelection.parcel,
                                }, { session });
                                if (!dstParcel) {
                                    throw new Error(`Destination parcel does not exist`);
                                }

                                // $addToSet = only add if not present
                                await parcelCol.updateOne(
                                    { _id: dstParcel._id },
                                    { $addToSet: { pallets: intPalletId } },
                                    { session }
                                );
                                transferResult.addedToParcel = true;
                            }

                            // Handle source: If source was a parcel, remove from source parcel's .pallets array
                            if (prevLoc !== destLoc) {
                                const prevParcel = await parcelCol.findOne({
                                    subdivision_id: prevLoc,
                                    "pallets": intPalletId
                                }, { session });
                                if (prevParcel) {
                                    await parcelCol.updateOne(
                                        { _id: prevParcel._id },
                                        { $pull: { pallets: intPalletId } },
                                        { session }
                                    );
                                    transferResult.removedFromSourceParcel = true;
                                }
                            }

                            // If returning to warehouse from parcel (or moving out of any parcel), remove pallet from ALL parcels where it may have existed
                            if (goingToWarehouse) {
                                // Defensive: Just remove from any stale parcels
                                await parcelCol.updateMany(
                                    { pallets: intPalletId },
                                    { $pull: { pallets: intPalletId } },
                                    { session }
                                );
                                transferResult.cleanedAllParcels = true;
                            }
                        });

                        results.push({
                            rowId,
                            status: "pallet-transfer-complete",
                            ...transferResult,
                        });
                    } catch (error) {
                        results.push({
                            rowId,
                            status: "error",
                            error: error instanceof Error ? error.message : error,
                        });
                    } finally {
                        await session.endSession();
                    }
                } catch (error) {
                    results.push({
                        rowId,
                        status: "error",
                        error: error instanceof Error ? error.message : error,
                    });
                }
            }

            // Return up-to-date pallet data (if that is desired, you can adapt this)
            const data = await palletCol.find().toArray();
            return {
                status: 200,
                body: JSON.stringify({ data, result: results }),
            };
        }
        /** end of pallet code insert. */

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

        context.log("warehouse", location.warehouse);

        /** @type {any[]} */
        const results: any[] = [];

        // Iterate over each inventory item to transfer
        for (const [rowId, rowSelection] of Object.entries(items)) {
            /** Validate transfer amount. */
            if (!rowSelection.amount || typeof rowSelection.amount !== "number") {
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

                if (location.warehouse) {
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