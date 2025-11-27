import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { MongoClient } from "mongodb";

export async function getSettings(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    if (!process.env || !process.env.ATLAS_URI) {
        return { status: 501, body: JSON.stringify({ data: [], error: 'Missing Environment Variable.' }) };
    }
    const client = new MongoClient(process.env.ATLAS_URI)
    await client.connect()
    try {
        const users = await client.db('Settings').collection('Users').find().toArray()
        const _categories = await client.db('Settings').collection('_Categories').find().toArray()
        const _locations = await client.db('Settings').collection('_Locations').find().toArray()
        const _prompts = await client.db('Settings').collection('_Prompts').find().toArray()
        const _selects = await client.db('Settings').collection('_Selects').find().toArray()

        await client.close()
        return { status: 200, body: JSON.stringify({ users, _categories, _locations, _prompts, _selects }) }
    } catch (error) {
        context.error(error)
        await client.close()
        return { status: 501, body: JSON.stringify({ err: true, error: error }) }
    }
};

app.http('getSettings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getSettings
});

