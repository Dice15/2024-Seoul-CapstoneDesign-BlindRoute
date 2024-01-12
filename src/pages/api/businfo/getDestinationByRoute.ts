import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import axios from 'axios';


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
                console.log(requestParam.busRouteId)
                await axios.get<GetDestinationByRouteApiResponse>(
                    "http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute",
                    {
                        params: {
                            serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING),
                            busRouteId: requestParam.busRouteId,
                            resultType: "json"
                        }
                    }
                ).then(async (stationInfo) => {
                    await axios.get<GetBusPosByVehIdApiResponse>(
                        "http://ws.bus.go.kr/api/rest/buspos/getBusPosByVehId",
                        {
                            params: {
                                serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING),
                                vehId: requestParam.vehId,
                                resultType: "json"
                            }
                        }
                    ).then((busPosition) => {
                        const currSeq = stationInfo.data.msgBody.itemList.findIndex((stInfo) => stInfo.seq === busPosition.data.msgBody.itemList[0].stOrd);
                        response.status(200).json({
                            msg: "정상적으로 처리되었습니다.",
                            itemList: stationInfo.data.msgBody.itemList.slice(currSeq).map((stInfo) => ({
                                seq: stInfo.seq,
                                stId: stInfo.station,
                                stNm: stInfo.stationNm,
                                tmX: "",
                                tmY: "",
                                posX: stInfo.posX,
                                posY: stInfo.gpsY,
                                arsId: stInfo.arsId,
                            }))
                        });
                    });
                });
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


interface GetDestinationByRouteApiResponse {
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
    busRouteId: string;
    busRouteNm: string;
    busRouteAbrv: string;
    seq: string;
    section: string;
    station: string;
    arsId: string;
    stationNm: string;
    gpsX: string;
    gpsY: string;
    posX: string;
    posY: string;
    fullSectDist: string;
    direction: string;
    stationNo: string;
    routeType: string;
    beginTm: string;
    lastTm: string;
    trnstnid: string;
    sectSpd: string;
    transYn: string;
}


interface GetBusPosByVehIdApiResponse {
    comMsgHeader: ComMsgHeader;
    msgHeader: MsgHeader;
    msgBody: {
        itemList: BusPosition[];
    };
}


interface BusPosition {
    vehId: string;
    stId: string;
    stOrd: string;
    stopFlag: string;
    dataTm: string;
    tmX: string;
    tmY: string;
    posX: string;
    posY: string;
    plainNo: string;
    busType: string;
    lastStnId: string;
    isFullFlag: string;
    congetion: string;
}
