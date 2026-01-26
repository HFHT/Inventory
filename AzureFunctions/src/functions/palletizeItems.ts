import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { allStrings, errorResponse, mergePalletContents } from "../utils";
import { MongoClient, MongoError, UpdateResult, InsertOneResult } from "mongodb";
import { BasePallet, Inventory } from "../types";

export type PalletizeControls = {
    controllingDB: string
}

export async function palletizeItems(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

    // Ensure D.B connection string exists
    if (!process.env || !process.env.ATLAS_URI) {
        return errorResponse(501, "Missing Environment Variable.");
    }

    let client: MongoClient | null = null;
    /** Collect skipped row IDs for later reporting */
    let skippedRows: number[] = [];

    try {
        // Validate request method
        if (request.method !== "PUT" && request.method !== "POST") {
            return errorResponse(405, "Invalid method.");
        }
        /**
         * @type {{ controls: TransferSelects, items: RowSelections }}
         */
        let req: { controls: PalletizeControls; items: BasePallet };
        try {
            req = (await request.json()) as { controls: PalletizeControls; items: BasePallet };
        } catch (e) {
            return errorResponse(400, "Malformed JSON body.");
        }
        const { controls, items } = req;

        // Validate controls and items structure
        if (!controls || !allStrings(controls)) {
            return errorResponse(400, "Invalid controls property.");
        }
        if (!items || typeof items !== "object" || items.contents.length === 0) {
            return errorResponse(400, "No items provided for transfer.");
        }

        // check the validity of the content amounts
        if (items.contents.some(item => typeof item.amount !== 'number' && isNaN(Number(item.inventory_id)))) {
            return errorResponse(400, "Invalid transfer contents.");
        }

        client = new MongoClient(process.env.ATLAS_URI);
        await client.connect();

        const existingPallet = await client.db("Construction").collection<BasePallet>("Pallets").findOne({ title: items.title });

        /** Collect successful or skipped transaction results */
        /** @type {Array<{ rowId: number, status: string, inventory?: any, pallet?: any, reason?: string }>} */
        const results: any[] = [];
        let palletResponse: InsertOneResult<BasePallet> | UpdateResult<BasePallet>;
        const session = client.startSession();

        try {
            await session.withTransaction(async () => {
                context.log('existingPallet', existingPallet);

                // 1. Pallet upsert (error if doesn't insert or replace)
                if (!existingPallet) {
                    palletResponse = await client!.db("Construction").collection<BasePallet>("Pallets")
                        .insertOne(items, { session });
                    if (!("insertedId" in palletResponse) || !palletResponse.insertedId) {
                        // Will cause transaction rollback
                        throw new Error("Failed to insert new pallet (no insertedId)");
                    }
                } else {
                    const updatedPallet = mergePalletContents(existingPallet, items);
                    palletResponse = await client!.db("Construction").collection<BasePallet>("Pallets")
                        .replaceOne({ _id: items._id }, updatedPallet, { session });
                    if (!palletResponse.modifiedCount) {
                        throw new Error("Failed to update existing pallet (no modifiedCount)");
                    }
                }

                // 2. Item-by-item inventory transfer
                for (const content of items.contents) {
                    let inventoryResponse: UpdateResult<Inventory>;

                    const inventoryId = Number(content.inventory_id);
                    try {
                        // Try update both locations at once
                        const result = await client!.db("Construction").collection<Inventory>('Inventory').updateOne(
                            {
                                _id: inventoryId,
                                $and: [
                                    { "quantity.byLocation.loc": items.location },
                                    { "quantity.byLocation.loc": items.title }
                                ]
                            },
                            {
                                $inc: {
                                    "quantity.byLocation.$[from].qty": -content.amount,
                                    "quantity.byLocation.$[to].qty": content.amount
                                }
                            },
                            {
                                arrayFilters: [
                                    { "from.loc": items.location },
                                    { "to.loc": items.title }
                                ],
                                session
                            }
                        );

                        if (result.matchedCount === 0 || result.modifiedCount === 0) {
                            // Try moving from 'fromLocation', then pushing/creating the pallet location
                            inventoryResponse = await client!.db("Construction").collection<Inventory>("Inventory").updateOne(
                                { _id: inventoryId, "quantity.byLocation.loc": items.location },
                                { $inc: { "quantity.byLocation.$[from].qty": -content.amount } },
                                { arrayFilters: [{ "from.loc": items.location }], session }
                            );
                            if (inventoryResponse.matchedCount === 0 || inventoryResponse.modifiedCount === 0) {
                                throw new Error('From location was missing from inventory item');
                            }
                            inventoryResponse = await client!.db("Construction").collection<Inventory>("Inventory").updateOne(
                                { _id: inventoryId },
                                { $push: { "quantity.byLocation": { loc: items.title, qty: content.amount } } },
                                { session }
                            );
                            if (inventoryResponse.modifiedCount === 0) {
                                throw new Error('Failed to push pallet location to inventory');
                            }
                        } else {
                            inventoryResponse = result; // Success
                        }

                        // Success for this row
                        results.push({
                            rowId: inventoryId,
                            status: 'updated',
                            inventory: inventoryResponse.modifiedCount,
                            pallet:
                                'insertedId' in palletResponse
                                    ? palletResponse.insertedId
                                    : palletResponse.modifiedCount,
                        });

                    } catch (err) {
                        // Track the skipped rowId for result reporting below (must throw so transaction rolls back)
                        context.log("Row inventory update failed, rolling back:", inventoryId, err);
                        skippedRows.push(inventoryId);
                        throw err; // Fails the whole transaction!
                    }
                }
            });

        } catch (error) {
            context.log("Transaction error:", error);
            // Everything rolled back! Report which rowIds skipped, mark them as skipped
            for (const content of items.contents) {
                const inventoryId = Number(content.inventory_id);
                results.push({
                    rowId: inventoryId,
                    status: 'skipped',
                    reason: skippedRows.includes(inventoryId)
                        ? (error instanceof Error ? error.message : String(error))
                        : 'transaction rolled back'
                });
            }
        } finally {
            await session.endSession();
        }

        const data = await client.db("Construction").collection<BasePallet>("Pallets").findOne({ title: items.title });

        return {
            status: 200,
            body: JSON.stringify({ result: results, pallet: data }),
        };

    } catch (error) {
        // ...[existing general catch block]...
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
};

app.http('palletizeItems', {
    methods: ['PUT', 'POST'],
    authLevel: 'anonymous',
    handler: palletizeItems
});




// import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
// import { allStrings, errorResponse, mergePalletContents } from "../utils";
// import { MongoClient, ClientSession, MongoError, UpdateResult, InsertOneResult } from "mongodb";
// import { BasePallet, Inventory } from "../types";

// export type PalletizeControls = {
//     controllingDB: string
// }


// export async function palletizeItems(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
//     // Ensure D.B connection string exists
//     if (!process.env || !process.env.ATLAS_URI) {
//         return errorResponse(501, "Missing Environment Variable.");
//     }

//     let client: MongoClient | null = null;
//     try {
//         // Validate request method
//         if (request.method !== "PUT" && request.method !== "POST") {
//             return errorResponse(405, "Invalid method.");
//         }
//         /**
//          * @type {{ controls: TransferSelects, items: RowSelections }}
//          */
//         let req: { controls: PalletizeControls; items: BasePallet };
//         try {
//             req = (await request.json()) as { controls: PalletizeControls; items: BasePallet };
//         } catch (e) {
//             return errorResponse(400, "Malformed JSON body.");
//         }
//         const { controls, items } = req;

//         // Validate controls and items structure
//         if (!controls || !allStrings(controls)) {
//             return errorResponse(400, "Invalid controls property.");
//         }
//         if (!items || typeof items !== "object" || items.contents.length === 0) {
//             return errorResponse(400, "No items provided for transfer.");
//         }

//         // check the validity of the content amounts
//         if (items.contents.some(item => typeof item.amount !== 'number' && isNaN(Number(item.inventory_id)))) {
//             return errorResponse(400, "Invalid transfer contents.");
//         }

//         client = new MongoClient(process.env.ATLAS_URI);
//         await client.connect();
//         /**
//          * In a session update the Mongo database
//          * If pallet exists then update it otherwise add it.
//          * Update inventory to transfer the amount from the items.fromLocation to the named pallet
//          *
//          */

//         const existingPallet = await client.db("Construction").collection<BasePallet>("Pallets").findOne({ title: items.title });

//         /** @type {any[]} */
//         const results: any[] = [];
//         let palletResponse: InsertOneResult<BasePallet> | UpdateResult<BasePallet>
//         /** @type {ClientSession} */
//         const session = client.startSession();
//         try {
//             await session.withTransaction(async () => {
//                 /** Add or update the pallet */
//                 context.log('existingPallet', existingPallet)
//                 if (!existingPallet) {
//                     /** New pallet; save it */
//                     palletResponse = await client!.db("Construction").collection<BasePallet>("Pallets").insertOne(items, { session })
//                 } else {
//                     /** Existing pallet; contents -> existing inventory_id adjust the amount, for new push them */
//                     const updatedPallet = mergePalletContents(existingPallet, items);
//                     // Now updatedPallet.contents is the merged array.
//                     palletResponse = await client!.db("Construction").collection<BasePallet>("Pallets").replaceOne({ _id: items._id }, updatedPallet, { session })
//                 }
//                 /** Adjust the Inventory collection and update each inventory_id  */
//                 // Iterate over each inventory item to transfer
//                 for (const [rowID, content] of Object.entries(items.contents)) {
//                     let inventoryResponse: UpdateResult<Inventory>
//                     context.log('for loop', content)
//                     const inventoryId = Number(content.inventory_id);

//                     // See if the pallet is already contains the item, if so update it.
//                     const result = await client!.db("Construction").collection<Inventory>('Inventory').updateOne(
//                         {
//                             _id: inventoryId,
//                             $and: [
//                                 { "quantity.byLocation.loc": items.fromLocation },
//                                 { "quantity.byLocation.loc": items.title }
//                             ]
//                         },
//                         {
//                             $inc: {
//                                 "quantity.byLocation.$[from].qty": -content.amount,
//                                 "quantity.byLocation.$[to].qty": content.amount
//                             }
//                         },
//                         {
//                             arrayFilters: [
//                                 { "from.loc": items.fromLocation },
//                                 { "to.loc": items.title }
//                             ],
//                             session
//                         }
//                     );
//                     context.log('result', result)
//                     // If the pallet doesn't have the item, add the pallet as a location with the amount as its quantity
//                     if (result.matchedCount === 0 || result.modifiedCount === 0) {
//                         inventoryResponse = await client!.db("Construction").collection<Inventory>("Inventory").updateOne(
//                             { _id: inventoryId, "quantity.byLocation.loc": items.fromLocation },
//                             { $inc: { "quantity.byLocation.$[from].qty": -content.amount } },
//                             { arrayFilters: [{ "from.loc": items.fromLocation }], session }
//                         );
//                         if (inventoryResponse.matchedCount === 0 || inventoryResponse.modifiedCount === 0) throw new Error('From location was missing from inventory item.')
//                         inventoryResponse = await client!.db("Construction").collection<Inventory>("Inventory").updateOne(
//                             { _id: inventoryId },
//                             { $push: { "quantity.byLocation": { loc: items.title, qty: content.amount } } },
//                             { session }
//                         );
//                     } else {
//                         // Return the results of location exists case.
//                         inventoryResponse = result
//                     }
//                     results.push({
//                         rowId: inventoryId, status: 'updated', inventory: inventoryResponse.modifiedCount, pallet: 'insertedId' in palletResponse
//                             ? palletResponse.insertedId
//                             : palletResponse.modifiedCount,
//                     })
//                 }
//             });
//         } catch (error) {
//             context.log("Transaction error:", error);
//             results.push({ status: "error", error: error instanceof Error ? error.message : error });
//         } finally {
//             await session.endSession();
//         }

//         return {
//             status: 200,
//             body: JSON.stringify({ result: results }),
//         };
//     } catch (error) {
//         // General catch-all error
//         context.error(error);
//         let message = "Unknown error";
//         if (error instanceof MongoError) {
//             message = `Database Error: ${error.message}`;
//         } else if (error instanceof Error) {
//             message = error.message;
//         }
//         return errorResponse(500, message);
//     } finally {
//         if (client) await client.close();
//     }

// };

// app.http('palletizeItems', {
//     methods: ['PUT', 'POST'],
//     authLevel: 'anonymous',
//     handler: palletizeItems
// });
