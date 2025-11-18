import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { MongoClient } from "mongodb";

export async function getMongoDB(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const db = request.query.get('db');
    const col = request.query.get('col');
    if (!db || !col) {
        return { status: 501, body: JSON.stringify({ data: [], error: 'Invalid props' }) };
    }
    if (!process.env || !process.env.ATLAS_URI) {
        return { status: 501, body: JSON.stringify({ data: [], error: 'Missing Environment Variable.' }) };
    }
    const client = new MongoClient(process.env.ATLAS_URI)
    await client.connect()

    try {
        const retVal = await client.db(db).collection(col).find().toArray()
        await client.close()
        return { status: 200, body: JSON.stringify(retVal) }
    } catch (error) {
        context.error(error)
        await client.close()
        return { status: 501, body: JSON.stringify({ error: error }) }

    };
}
app.http('getMongoDB', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getMongoDB
});
