import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import axios from 'axios';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY1 });

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "GET": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", itemList: [] });
                break;
            }

            try {
                const requestParam = request.query;
                const prompt = requestParam.stationName as string;
                console.log(prompt);
                const gptReponse = await openai.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: `다음 문장에서 버스 정류장 이름을 추출하고 오타가 있다면 수정 후, 버스 정류장 이름만 대답해봐: ${prompt}`,
                        },
                    ],
                    model: "gpt-3.5-turbo",
                });

                if (gptReponse.choices && gptReponse.choices.length > 0) {
                    const stationName = gptReponse.choices[0].message.content as string;
                    console.log(stationName);
                    const responseData = await axios.get<GetStationByNameApiResponse>(
                        "http://ws.bus.go.kr/api/rest/stationinfo/getStationByName",
                        {
                            params: {
                                serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING_KEY4),
                                stSrch: stationName,
                                resultType: "json"
                            }
                        }
                    ).then(async (getStationByNameResponse) =>
                        await Promise.all(getStationByNameResponse.data.msgBody.itemList.map(async (stationInfo) => (
                            {
                                ...stationInfo,
                                seq: "",
                                stDir: await axios.get<GetStationByUidItemApiResponse>(
                                    "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid",
                                    {
                                        params: {
                                            serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING_KEY4),
                                            arsId: stationInfo.arsId,
                                            resultType: "json"
                                        }
                                    }
                                ).then((getStationByUidItemResponse) => {
                                    const countingMap: {
                                        [key in string]: number;
                                    } = {};

                                    const maxRequency = {
                                        count: 0,
                                        nxtStn: ""
                                    }

                                    getStationByUidItemResponse.data.msgBody.itemList.forEach((item) => {
                                        if (countingMap[item.nxtStn] === undefined) countingMap[item.nxtStn] = 0;
                                        if (++countingMap[item.nxtStn] > maxRequency.count) {
                                            maxRequency.count = countingMap[item.nxtStn];
                                            maxRequency.nxtStn = item.nxtStn;
                                        }
                                    });

                                    return maxRequency.nxtStn;
                                })
                            }
                        )))
                    );

                    response.status(200).json({ msg: "정상적으로 처리되었습니다.", itemList: responseData });
                } else {
                    response.status(200).json({ name: "버스 정류장 이름을 추출할 수 없습니다." });
                }
            } catch (error) {
                response.status(502).json({ msg: "API 요청 중 오류가 발생했습니다.", itemList: [] });
            }
            break;
        }
        default: {
            response.status(405).json({ msg: "지원하지 않는 메서드입니다.", itemList: [] });
            break;
        }
    }
}


interface GetStationByNameApiResponse {
    comMsgHeader: ComMsgHeader;
    msgHeader: MsgHeader;
    msgBody: {
        itemList: StationInfo[];
    };
}


interface ComMsgHeader {
    errMsg: string | null;
    requestMsgID: string | null;
    responseMsgID: string | null;
    responseTime: string | null;
    successYN: string | null;
    returnCode: string | null;
}


interface MsgHeader {
    headerMsg: string;
    headerCd: string;
    itemCount: number;
}


interface StationInfo {
    stId: string;
    stNm: string;
    tmX: string;
    tmY: string;
    posX: string;
    posY: string;
    arsId: string;
}


interface GetStationByUidItemApiResponse {
    comMsgHeader: ComMsgHeader;
    msgHeader: MsgHeader;
    msgBody: {
        itemList: StationByUidItem[];
    };
}


interface StationByUidItem {
    stId: string;
    stNm: string;
    arsId: string;
    busRouteId: string;
    rtNm: string;
    busRouteAbrv: string;
    sectNm: string;
    gpsX: string;
    gpsY: string;
    posX: string;
    posY: string;
    stationTp: string;
    firstTm: string;
    lastTm: string;
    term: string;
    routeType: string;
    nextBus: string;
    staOrd: string;
    vehId1: string;
    plainNo1: string | null;
    sectOrd1: string;
    stationNm1: string;
    traTime1: string;
    traSpd1: string;
    isArrive1: string;
    repTm1: string | null;
    isLast1: string;
    busType1: string;
    vehId2: string;
    plainNo2: string | null;
    sectOrd2: string;
    stationNm2: string;
    traTime2: string;
    traSpd2: string;
    isArrive2: string;
    repTm2: string | null;
    isLast2: string;
    busType2: string;
    adirection: string;
    arrmsg1: string;
    arrmsg2: string;
    arrmsgSec1: string;
    arrmsgSec2: string;
    nxtStn: string;
    rerdieDiv1: string;
    rerdieDiv2: string;
    rerideNum1: string;
    rerideNum2: string;
    isFullFlag1: string;
    isFullFlag2: string;
    deTourAt: string;
    congestion1: string;
    congestion2: string;
}