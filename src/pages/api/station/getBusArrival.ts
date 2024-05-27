import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import axios from 'axios';
import { IBusArrival } from '@/core/type/IBusArrival';


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "GET": {
            if (!session) {
                response.status(401).end('Unauthorized');
                return;
            }

            try {
                const { stationArsId, busRouteId } = request.query;

                if (!stationArsId || !busRouteId) {
                    response.status(400).json({ msg: "Missing required query parameters" });
                    return;
                }

                const busArrival: IBusArrival = await axios.get<GetStationByUidItemApiResponse>(
                    "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid", {
                    params: {
                        serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING_KEY3),
                        arsId: stationArsId,
                        resultType: "json"
                    }
                }).then((getStationByUidItemApiResponse) => {
                    const busRouteInfo = getStationByUidItemApiResponse.data.msgBody.itemList.find((busArrivalInfo) => busArrivalInfo.busRouteId === busRouteId);
                    const result = {
                        busArrMsg1: "운행종료",
                        busVehId1: "",
                        busArrMsg2: "운행종료",
                        busVehId2: "",
                    }

                    if (busRouteInfo && busRouteInfo.arrmsg1 !== "운행종료") {
                        result.busArrMsg1 = busRouteInfo.arrmsg1;
                        result.busVehId1 = busRouteInfo.vehId1;
                    }

                    if (busRouteInfo && busRouteInfo.arrmsg2 !== "운행종료") {
                        result.busArrMsg2 = busRouteInfo.arrmsg2;
                        result.busVehId2 = busRouteInfo.vehId2;
                    }

                    return result;
                })

                console.log(busArrival)

                response.status(200).json({
                    msg: "정상적으로 처리되었습니다.",
                    data: {
                        busArrival: busArrival
                    }
                });
            } catch (error) {
                console.error(error);
                response.status(500).end(`${error}`);
            }
            break;
        }
        default: {
            response.setHeader('Allow', ['GET']);
            response.status(405).end(`Method ${request.method} Not Allowed`);
        }
    }
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