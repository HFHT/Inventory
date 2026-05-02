import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function warrantyEmails(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const req = (await request.json()) as { from: string; to: string; subject: string; body: string; bodyPreview: string; receivedDateTime: string; attachments: { Name: string; ContentType: string; ContentBytes: string }[] };

    const { from, to, subject, body, bodyPreview, receivedDateTime, attachments } = req
    context.log('from:', from)
    context.log('to:', to)
    context.log('subject:', subject)
    context.log('body:', body)
    context.log('bodyPreview:', bodyPreview)
    context.log('receivedDateTime:', receivedDateTime)
    attachments.forEach(attach => {
        context.log('name:', attach.Name)
        context.log('ContentType:', attach.ContentType)
        context.log('ContentBytes:', attach.ContentBytes)
    })

    return {
        status: 200
    };
};

app.http('warrantyEmails', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: warrantyEmails
});
