import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    switch (request.method) {
        case "GET": {
            try {
                const thread = await openai.beta.threads.create();
                response.status(200).json({ threadId: thread.id });
            }
            catch (error) {
                response.status(502).json({ threadId: null });
            }
            break;
        }
        default: {
            response.status(405).json({ threadId: null });
            break;
        }
    }
}