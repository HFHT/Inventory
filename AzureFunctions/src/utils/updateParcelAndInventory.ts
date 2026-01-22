// import { MongoClient, ObjectId } from "mongodb";
// import { Inventory, ParcelInventoryType } from "../types";

// /**
//  * Performs two MongoDB updates in a single atomic transaction:
//  *   1. Updates a ParcelInventory document with new bill of materials
//  *   2. Updates an Inventory document, reducing a quantity in-place with an aggregation pipeline
//  * @param client - The MongoDB client instance
//  * @param parcelId - The _id of the ParcelInventory document to update
//  * @param newBillOfMaterial - The new bill of materials object to push
//  * @param rowId - The _id of the Inventory document to update
//  * @param locationOfInventory - The location identifier to match
//  * @param rowSelection - Object containing 'amount' field for subtraction
//  * @returns {Promise<void>}
//  */
// async function updateParcelAndInventory(
//   client: MongoClient,
//   parcelId: ObjectId,
//   newBillOfMaterial: any,
//   rowId: ObjectId,
//   locationOfInventory: string,
//   rowSelection: { amount: number }
// ): Promise<void> {
//   const session = client.startSession();

//   try {
//     await session.withTransaction(async () => {
//       // First update: push new bill of materials
//       await client
//         .db('Homes')
//         .collection<ParcelInventoryType>('ParcelInventory')
//         .updateOne(
//           { _id: parcelId },
//           { $push: { billOfMaterial: newBillOfMaterial } },
//           { session }
//         );

//       // Second update: inventory update with pipeline
//       await client
//         .db('Construction')
//         .collection<Inventory>('Inventory')
//         .updateOne(
//           { _id: rowId },
//           [
//             {
//               $set: {
//                 "quantity.byLocation": {
//                   $map: {
//                     input: "$quantity.byLocation",
//                     as: "loc",
//                     in: {
//                       $cond: [
//                         { $eq: ["$$loc.loc", locationOfInventory] },
//                         {
//                           $mergeObjects: [
//                             "$$loc",
//                             { qty: { $subtract: ["$$loc.qty", rowSelection.amount] } }
//                           ]
//                         },
//                         "$$loc" // Don't forget else branch!
//                       ]
//                     }
//                   }
//                 }
//               }
//             }
//           ],
//           { session }
//         );
//     });
//   } finally {
//     await session.endSession();
//   }
// }