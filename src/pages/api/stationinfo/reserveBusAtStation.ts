import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import MongoDbProvider from '@/core/modules/database/MongoDbProvider';
import axios from 'axios';


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const db = await MongoDbProvider.getDb(process.env.BLINDROUTE_MONGODB_URI);
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "POST": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", item: null });
                break;
            }

            try {
                const requestParam: {
                    arsId: string;
                    busRouteId: string
                } = request.body;

                const reservedBusArrInfo = await axios.get<GetStationByUidItemApiResponse>(
                    "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid",
                    {
                        params: {
                            serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING),
                            arsId: requestParam.arsId,
                            resultType: "json"
                        }
                    }
                ).then(async (stationInfo) => {
                    const busArrInfo = stationInfo.data.msgBody.itemList.find((busArrivalInfo) => busArrivalInfo.busRouteId === requestParam.busRouteId);
                    if (busArrInfo && busArrInfo.arrmsg1 !== "운행종료") {
                        try {
                            const insertResult = await db.collection("boarding_reservations").insertOne({
                                owner: session.user?.email,
                                arsId: requestParam.arsId,
                                busRouteId: requestParam.busRouteId
                            });

                            if (insertResult.acknowledged === undefined) {
                                response.status(500).json({ msg: "DB 저장 중 오류가 발생했습니다.", item: null });
                            } else {
                                response.status(200).json({ msg: "정상적으로 처리되었습니다.", item: insertResult.insertedId });
                            }
                        }
                        catch (error) {
                            response.status(502).json({ msg: "DB 저장 중 오류가 발생했습니다.", item: null });
                        }
                    } else {
                        response.status(200).json({ msg: "운행 종료되었습니다.", item: null });
                    }
                });
            } catch (error) {
                response.status(405).json({ msg: "지원하지 않는 메서드입니다.", item: null });
            }
            break;
        }
        case "DELETE": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", item: null });
                break;
            }

            try {
                const deleteResult = await db.collection("boarding_reservations").deleteMany({
                    owner: session.user?.email,
                });

                if (deleteResult.acknowledged === undefined) {
                    response.status(500).json({ msg: "DB 삭제 중 오류가 발생했습니다.", item: null });
                } else {
                    response.status(200).json({ msg: "정상적으로 처리되었습니다.", item: deleteResult.deletedCount });
                }
            } catch (error) {
                response.status(502).json({ msg: "DB 삭제 중 오류가 발생했습니다.", item: null });
            }
            break;
        }
        default: {
            response.status(405).json({ msg: "지원하지 않는 메서드입니다.", item: null });
            break;
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