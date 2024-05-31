import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


async function getGptResponse(threadId: string, assistantId: string, requestMessage: string) {
    // thread 불러오기
    await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: requestMessage
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

    return assistantMessage?.content[0].type === "text" ? assistantMessage?.content[0].text.value : "";
}


function parseGptResponse(gptResponse: string) {
    const content = gptResponse.match(/\{(.*?)\}/)![1];
    const pairs = content.split(', ');
    const obj: { [key: string]: string } = {};

    pairs.forEach(pair => {
        const [key, value] = pair.split(' : ').map(s => s.trim());
        obj[key] = value;
    });

    return obj;
}


async function getStation(keyword: string) {
    return await axios.get<GetStationByNameApiResponse>(
        "http://ws.bus.go.kr/api/rest/stationinfo/getStationByName",
        {
            params: {
                serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING_KEY4),
                stSrch: keyword,
                resultType: "json"
            }
        }
    ).then(async (getStationByNameResponse) => {
        return await Promise.all((getStationByNameResponse.data.msgBody.itemList ?? []).map(async (stationInfo) => {
            return {
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
        }))
    });
}


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    switch (request.method) {
        case 'POST': {
            try {
                const { threadId, userMessage } = request.body;
                const assistantId = process.env.BLINDROUTE_ASSISTANT_V1;

                const requestResponse = await getGptResponse(threadId, assistantId, `#request{ msg : ${userMessage} }`).then(value => {
                    if (value.includes("extract")) return "extract";
                    if (value.includes("get_bookmark")) return "get_bookmark";
                    return "other";
                });

                let stationName = "";
                let stationResponse: {
                    seq: string;
                    stDir: string;
                    stId: string;
                    stNm: string;
                    tmX: string;
                    tmY: string;
                    posX: string;
                    posY: string;
                    arsId: string;
                }[] = [];

                switch (requestResponse) {
                    case "extract": {
                        stationResponse = await getGptResponse(threadId, assistantId, `#extract{ msg : ${userMessage} }`).then(value => {
                            const extractResponse = parseGptResponse(value) as { msg: string };
                            console.log(extractResponse)
                            return getStation(stationName = extractResponse.msg);
                        });

                        if (stationResponse.length === 0) {
                            stationResponse = await getGptResponse(threadId, assistantId, `#modify{ msg : ${userMessage} }`).then(value => {
                                const modifyResponse = parseGptResponse(value) as { msg: string };
                                console.log(modifyResponse)
                                return getStation(stationName = modifyResponse.msg);
                            });
                        }

                        if (stationResponse.length) {
                            await getGptResponse(threadId, assistantId, `#add_bookmark{ msg : ${stationName} }`)
                        }
                        break;
                    }
                    case "get_bookmark": {
                        stationResponse = await getGptResponse(threadId, assistantId, `#get_bookmark`).then(async (value) => {
                            const bookmarkResponse = (parseGptResponse(value) as { msg: string }).msg.split(',');
                            console.log(bookmarkResponse)
                            return (await Promise.all(bookmarkResponse.map((bookmark) => getStation(bookmark)))).flat();
                        });
                        break;
                    }
                    default: { }
                }

                response.status(200).json({ msg: "정상적으로 처리되었습니다.", keyword: stationName, itemList: stationResponse });
            } catch (error) {
                console.error(error);
                response.status(500).json({ msg: error, keyword: "", itemList: [] });
            }
            break;
        }
        default:
            response.setHeader('Allow', ['POST']);
            response.status(405).end(`Method ${request.method} Not Allowed`);
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