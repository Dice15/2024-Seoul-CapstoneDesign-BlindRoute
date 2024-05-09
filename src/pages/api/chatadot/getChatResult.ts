import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY1 });

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    switch (request.method) {
        case "GET": {
            try {
                const requestParam = request.query;
                const prompt = requestParam.message as string;
                const gptReponse = await openai.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: "당신은 사람과 대화할 수 있는 챗봇입니다."
                        },
                        {
                            role: "system",
                            content: `일반 대화로 자유롭게 대화를 진행합니다. 만약 사용자가 특정 명령어를 포함한 메시지를 보내면 해당 명령어에 따라 특수 기능을 수행합니다.
                                      명령어 목록:
                                      #1 "시각장애인 대중교통 안내"
                                      초기 반응: "안녕하세요! 시각장애인 대중교통 안내를 시작하겠습니다. 출발지와 도착지를 알려주세요."
                                      사용자가 출발지와 도착지를 모두 제공한 경우:
                                      -> 위치를 추출하고 오타를 확인합니다. 오타가 있으면 정확한 지명으로 수정한 후 "@blindroute{ start: 수정된 출발지, destination: 수정된 도착지 }"로 응답합니다.
                                      출발지나 도착지 중 하나라도 빠진 경우:
                                      -> 사용자에게 다시 두 위치를 모두 제공하도록 요청합니다.
                                      사용자가 안내를 종료하고자 하는 경우:
                                      -> 시각장애인 대중교통 안내를 종료하고 일반 대화로 돌아갑니다.
                                      
                                      예시:
                                      - 사용자: "충무루에서 동역아로 가고 싶어요." -> "충무로에서 동역사로 가고 싶어요."로 수정 후 "@cmd{ start: 충무로, destination: 동역사 }"로 응답합니다.
                                      `
                        },
                        {
                            role: "user",
                            content: `${prompt}`,
                        },
                    ],
                    model: "gpt-3.5-turbo",
                });

                if (gptReponse.choices && gptReponse.choices.length > 0) {
                    response.status(200).json({ msg: "정상적으로 처리되었습니다.", message: gptReponse.choices[0].message.content as string });
                } else {
                    response.status(200).json({ msg: "API 요청 중 오류가 발생했습니다.", message: "" });
                }
            } catch (error) {
                response.status(502).json({ msg: "API 요청 중 오류가 발생했습니다.", message: "" });
            }
            break;
        }
        default: {
            response.status(405).json({ msg: "지원하지 않는 메서드입니다.", message: "" });
            break;
        }
    }
}