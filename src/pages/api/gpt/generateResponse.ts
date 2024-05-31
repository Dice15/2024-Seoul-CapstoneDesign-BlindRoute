import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    switch (request.method) {
        case 'POST': {
            try {
                const { threadId, userMessage } = request.body;
                const assistantId = process.env.BLINDROUTE_ASSISTANT;

                // thread 불러오기
                const message = await openai.beta.threads.messages.create(threadId, {
                    role: 'user',
                    content: userMessage
                });

                // assistant 불러오기
                const run = await openai.beta.threads.runs.create(threadId, {
                    assistant_id: assistantId
                });

                // thread 실행이 완료될 때까지 대기
                let runStatus = run.status;
                while (runStatus !== 'completed') {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Polling delay
                    const updatedRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
                    runStatus = updatedRun.status;
                }

                // thread에서 메시지 가져오기
                const messages = await openai.beta.threads.messages.list(threadId);
                const assistantMessage = messages.data.find(msg => msg.role === 'assistant');

                // assistant의 응답을 클라이언트에 전송
                response.status(200).json({ message: assistantMessage?.content[0].type === "text" ? assistantMessage?.content[0].text.value : "" });
            } catch (error) {
                console.error(error);
                response.status(500).json({ message: error });
            }
            break;
        }
        default:
            response.setHeader('Allow', ['POST']);
            response.status(405).end(`Method ${request.method} Not Allowed`);
    }
}