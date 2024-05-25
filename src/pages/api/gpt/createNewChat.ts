import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import OpenAI from "openai";
import { authOptions } from '../auth/[...nextauth]';
import MongoDbProvider from '@/core/modules/database/MongoDbProvider';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const db = await MongoDbProvider.connectDb(process.env.BLINDROUTE_MONGODB_URI).then(() => MongoDbProvider.getDb());
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "GET": {
            if (!session) {
                response.status(401).json({ threadId: null });
                return;
            }

            const savedThread = await db.collection("gptthread").findOne({ id: session.user.id });
            if (savedThread) {
                response.status(200).json({ threadId: savedThread.threadId });
            }
            else {
                try {
                    const newThread = await openai.beta.threads.create().then(async (value) => {
                        await db.collection("gptthread").insertOne({
                            id: session.user.id,
                            threadId: value.id
                        });
                        return value;
                    });

                    response.status(200).json({ threadId: newThread.id });
                }
                catch (error) {
                    console.error(error)
                    response.status(502).json({ threadId: null });
                }
            }
            break;
        }
        default: {
            response.status(405).json({ threadId: null });
            break;
        }
    }
}