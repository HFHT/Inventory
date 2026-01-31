
/**
 * @fileoverview Azure HTTP-trigger Function for MongoDB CRUD operations (GET, POST, PUT, DELETE) with enhanced error and exception handling.
 * @module mongoDB
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { MongoClient } from "mongodb";

/**
 * Interface describing the structure of a request body.
 * @typedef {Object} RequestBody
 * @property {string} db - The MongoDB database name.
 * @property {string} col - The MongoDB collection name.
 * @property {any[]} rows - The operations/filters/documents for the operation.
 */

/**
 * Azure Function to perform CRUD operations on MongoDB via HTTP methods.
 *
 * Supported methods:
 * - GET: Query all docs (use query string for db & col)
 * - POST: Insert multiple docs (provide db, col, rows in body)
 * - PUT: Update multiple docs (provide db, col, rows: [{filter, update}])
 * - DELETE: Delete docs matching filters (provide db, col, rows: [filter])
 *
 * Requires the environment variable ATLAS_URI for MongoDB connection.
 *
 * @param {HttpRequest} request - The HTTP request.
 * @param {InvocationContext} context - The Azure invocation context.
 * @returns {Promise<HttpResponseInit>} The HTTP response.
 */
export async function mongoDB(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    // Ensure DB connection string exists
    if (!process.env || !process.env.ATLAS_URI) {
        context.error('Missing required environment variable: ATLAS_URI');
        return {
            status: 501,
            body: JSON.stringify({ data: [], error: 'Missing Environment Variable: ATLAS_URI.' }),
            headers: { "Content-Type": "application/json" }
        };
    }

    const client = new MongoClient(process.env.ATLAS_URI);

    let db: string | null = null;
    let col: string | null = null;
    let rows: any[] = [];

    try {
        // Try to connect to MongoDB
        try {
            await client.connect();
        } catch (err: any) {
            context.error('MongoDB connection error:', err);
            return {
                status: 503,
                body: JSON.stringify({ data: [], error: 'Cannot connect to MongoDB.' }),
                headers: { "Content-Type": "application/json" }
            };
        }

        // Parameter extraction and validation
        try {
            if (request.method === 'GET') {
                db = request.query.get('db');
                col = request.query.get('col');
                rows = []; // Not used
            } else {
                const req = await request.json() as { db: string; col: string; rows: any[] };
                db = req?.db;
                col = req?.col;
                rows = req?.rows;
            }

            if (typeof db !== 'string' || typeof col !== 'string' || (!Array.isArray(rows) && request.method !== 'GET')) {
                context.error('Invalid request parameters.', { db, col, rows });
                return {
                    status: 400,
                    body: JSON.stringify({ data: [], error: 'Invalid request parameters: db, col, rows.' }),
                    headers: { "Content-Type": "application/json" }
                };
            }
        } catch (err: any) {
            context.error('Error parsing request body/query.', err);
            return {
                status: 400,
                body: JSON.stringify({ data: [], error: 'Malformed request or missing parameters.' }),
                headers: { "Content-Type": "application/json" }
            };
        }

        // Main CRUD switch
        switch (request.method) {
            /**
             * @name GET
             * @description Queries all documents from the specified collection.
             */
            case 'GET': {
                try {
                    const data = await client.db(db).collection(col).find().toArray();
                    return { status: 200, body: JSON.stringify({ data }), headers: { "Content-Type": "application/json" } };
                } catch (err: any) {
                    context.error('GET error:', err);
                    return {
                        status: 500,
                        body: JSON.stringify({ data: [], error: `Failed to fetch documents: ${err?.message}` }),
                        headers: { "Content-Type": "application/json" }
                    };
                }
            }

            /**
             * @name POST
             * @description Inserts multiple documents into the specified collection.
             */
            case 'POST': {
                try {
                    if (!rows.length) {
                        return {
                            status: 400,
                            body: JSON.stringify({ data: [], error: 'No documents to insert.' }),
                            headers: { "Content-Type": "application/json" }
                        };
                    }
                    const result = await client.db(db).collection(col).insertMany(rows);
                    const data = await client.db(db).collection(col).find().toArray();
                    return { status: 200, body: JSON.stringify({ data, result }), headers: { "Content-Type": "application/json" } };
                } catch (err: any) {
                    context.error('POST error:', err);
                    return {
                        status: 500,
                        body: JSON.stringify({ data: [], error: `Insert failed: ${err?.message}` }),
                        headers: { "Content-Type": "application/json" }
                    };
                }
            }

            /**
             * @name PUT
             * @description Updates documents in the collection using the provided filter/update pairs.
             * Each row must contain 'filter' and 'update'.
             */
            case 'PUT': {
                try {
                    if (!rows.length) {
                        return {
                            status: 400,
                            body: JSON.stringify({ data: [], error: 'No update operations provided.' }),
                            headers: { "Content-Type": "application/json" }
                        };
                    }
                    const result: any[] = [];
                    for (const row of rows) {
                        if (!row?.filter || !row?.update) {
                            context.log('PUT skipped row lacking filter or update:', row);
                            result.push({ error: 'PUT skipped row lacking filter or update:', row });
                            continue;
                        }
                        try {
                            const retVal = await client.db(db).collection(col).replaceOne(row.filter, row.update);
                            result.push(retVal);
                        } catch (opErr: any) {
                            context.error('PUT operation error for row:', row, opErr);
                            result.push({ error: opErr?.message, row });
                        }
                    }
                    const data = await client.db(db).collection(col).find().toArray();
                    return { status: 200, body: JSON.stringify({ data, result }), headers: { "Content-Type": "application/json" } };
                } catch (err: any) {
                    context.error('PUT error:', err);
                    return {
                        status: 500,
                        body: JSON.stringify({ data: [], error: `Update failed: ${err?.message}` }),
                        headers: { "Content-Type": "application/json" }
                    };
                }
            }

            /**
             * @name DELETE
             * @description Deletes documents matching the given filters in the collection.
             */
            case 'DELETE': {
                try {
                    if (!rows.length) {
                        return {
                            status: 400,
                            body: JSON.stringify({ data: [], error: 'No delete filters provided.' }),
                            headers: { "Content-Type": "application/json" }
                        };
                    }
                    const result: any[] = [];
                    for (const filter of rows) {
                        try {
                            const retVal = await client.db(db).collection(col).deleteMany(filter);
                            result.push(retVal);
                        } catch (opErr: any) {
                            context.error('DELETE operation error for filter:', filter, opErr);
                            result.push({ error: opErr?.message, filter });
                        }
                    }
                    const data = await client.db(db).collection(col).find().toArray();
                    return { status: 200, body: JSON.stringify({ data, result }), headers: { "Content-Type": "application/json" } };
                } catch (err: any) {
                    context.error('DELETE error:', err);
                    return {
                        status: 500,
                        body: JSON.stringify({ data: [], error: `Delete failed: ${err?.message}` }),
                        headers: { "Content-Type": "application/json" }
                    };
                }
            }

            default:
                context.error('Unknown HTTP method:', request.method);
                return {
                    status: 405,
                    body: JSON.stringify({ data: [], error: 'Unsupported HTTP method.' }),
                    headers: { "Content-Type": "application/json" }
                };
        }

    } catch (error: any) {
        context.error('Unhandled error:', error);
        return {
            status: 500,
            body: JSON.stringify({ data: [], error: error?.message || 'Unknown error' }),
            headers: { "Content-Type": "application/json" }
        };
    } finally {
        try {
            await client.close();
        } catch (closeErr: any) {
            context.error('Error closing MongoDB client:', closeErr);
        }
    }
}

/**
 * Azure HTTP Function registration for MongoDB operations.
 */
app.http('mongoDB', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    handler: mongoDB
});


// /**
//  * @fileoverview Azure HTTP-trigger Function for MongoDB CRUD operations (GET, POST, PUT, DELETE).
//  * @module mongoDB
//  */

// import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
// import { MongoClient } from "mongodb";

// /**
//  * Interface describing the structure of a request body.
//  * @typedef {Object} RequestBody
//  * @property {string} db - The MongoDB database name.
//  * @property {string} col - The MongoDB collection name.
//  * @property {any[]} rows - The operations/filters/documents for the operation.
//  */

// /**
//  * Azure Function to perform CRUD operations on MongoDB via HTTP methods.
//  *
//  * Supported methods:
//  * - GET: Query all docs (use query string for db & col)
//  * - POST: Insert multiple docs (provide db, col, rows in body)
//  * - PUT: Update multiple docs (provide db, col, rows: [{filter, update}])
//  * - DELETE: Delete docs matching filters (provide db, col, rows: [filter])
//  *
//  * Requires the environment variable ATLAS_URI for MongoDB connection.
//  *
//  * @param {HttpRequest} request - The HTTP request.
//  * @param {InvocationContext} context - The Azure invocation context.
//  * @returns {Promise<HttpResponseInit>} The HTTP response.
//  */
// export async function mongoDB(
//     request: HttpRequest,
//     context: InvocationContext
// ): Promise<HttpResponseInit> {
//     // Ensure D.B connection string exists
//     if (!process.env || !process.env.ATLAS_URI) {
//         return {
//             status: 501,
//             body: JSON.stringify({ data: [], error: 'Missing Environment Variable.' })
//         };
//     }

//     /** @type {MongoClient} */
//     const client = new MongoClient(process.env.ATLAS_URI);

//     // Gather input parameters
//     let db: string | null = null;
//     let col: string | null = null;
//     let rows: any[] = [];

//     try {
//         await client.connect();

//         if (request.method === 'GET') {
//             db = request.query.get('db');
//             col = request.query.get('col');
//             rows = []; // Not used
//         } else {
//             const req = (await request.json()) as { db: string; col: string; rows: any[] };
//             db = req.db;
//             col = req.col;
//             rows = req.rows;
//         }

//         if (!db || !col || !rows) {
//             return {
//                 status: 501,
//                 body: JSON.stringify({ data: [], error: 'Invalid props.' })
//             };
//         }

//         switch (request.method) {
//             /**
//              * @name GET
//              * @description Queries all documents from the specified collection.
//              */
//             case 'GET': {
//                 const data = await client.db(db).collection(col).find().toArray();
//                 return { status: 200, body: JSON.stringify({ data: data }) };
//             }

//             /**
//              * @name POST
//              * @description Inserts multiple documents into the specified collection.
//              */
//             case 'POST': {
//                 const result = await client.db(db).collection(col).insertMany(rows);
//                 const data = await client.db(db).collection(col).find().toArray();
//                 return { status: 200, body: JSON.stringify({ data: data, result: result }) };
//             }

//             /**
//              * @name PUT
//              * @description Updates documents in the collection using the provided filter/update pairs.
//              * Each row must contain 'filter' and 'update'.
//              */
//             case 'PUT': {
//                 const result: any[] = [];
//                 for (const row of rows) {
//                     if (!row.filter || !row.update) continue;
//                     const retVal = await client.db(db).collection(col).replaceOne(row.filter, row.update);
//                     result.push(retVal);
//                 }
//                 const data = await client.db(db).collection(col).find().toArray();
//                 return { status: 200, body: JSON.stringify({ data: data, result: result }) };
//             }

//             /**
//              * @name DELETE
//              * @description Deletes documents matching the given filters in the collection.
//              */
//             case 'DELETE': {
//                 const result: any[] = [];
//                 for (const filter of rows) {
//                     const retVal = await client.db(db).collection(col).deleteMany(filter);
//                     result.push(retVal);
//                 }
//                 const data = await client.db(db).collection(col).find().toArray();
//                 return { status: 200, body: JSON.stringify({ data: data, result: result }) };
//             }

//             default:
//                 return {
//                     status: 405,
//                     body: JSON.stringify({ data: [], error: 'Unknown method.' })
//                 };
//         }
//     } catch (error: any) {
//         context.error(error);
//         return {
//             status: 500,
//             body: JSON.stringify({ data: [], error: error?.message || 'Unknown error' })
//         };
//     } finally {
//         await client.close();
//     }
// }

// /**
//  * Azure HTTP Function registration for MongoDB operations.
//  */
// app.http('mongoDB', {
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     authLevel: 'anonymous',
//     handler: mongoDB
// });