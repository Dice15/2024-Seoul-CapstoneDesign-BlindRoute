import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import MongoDbProvider from '@/core/modules/database/MongoDbProvider';
import axios from 'axios';
import { ObjectId } from 'mongodb';


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const db = await MongoDbProvider.getDb(process.env.BLINDROUTE_MONGODB_URI);
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "GET": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", item: null });
                break;
            }

            try {
                const requestParam = request.query;
                const reservation = await db.collection("boarding_reservations").findOne<ReservationDbResponse>({
                    _id: new ObjectId(requestParam.reservationId as string)
                });

                if (reservation === null) {
                    response.status(500).json({ msg: "DB에서 예약을 찾을 수 없습니다.", item: null });
                } else {
                    const reservedBusArrInfo = await axios.get<GetStationByUidItemApiResponse>(
                        "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid",
                        {
                            params: {
                                serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING),
                                arsId: reservation.arsId,
                                resultType: "json"
                            }
                        }
                    ).then(async (stationInfo) => {
                        const busArrInfo = stationInfo.data.msgBody.itemList.find((busArrivalInfo) => busArrivalInfo.busRouteId === reservation.busRouteId);
                        if (busArrInfo && busArrInfo.arrmsg1 !== "운행종료") {
                            console.log(busArrInfo.arrmsg1, busArrInfo.vehId1)
                            return {
                                arrmsg: busArrInfo.arrmsg1,
                                vehId: busArrInfo.vehId1,
                                // ...(await axios.get<GetBusPosByVehIdApiResponse>(
                                //     "http://ws.bus.go.kr/api/rest/buspos/getBusPosByVehId",
                                //     {
                                //         params: {
                                //             serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING),
                                //             vehId: busArrInfo.vehId1,
                                //             resultType: "json"
                                //         }
                                //     }
                                // ).then((busLocInfo) => {
                                //     const temp = busLocInfo.data.msgBody.itemList[0];
                                //     console.log(busArrInfo.isArrive1, busArrInfo.posX, busArrInfo.posY, "/", temp.posX, temp.posY);
                                //     return {}
                                // }))
                            }
                        }
                        return null;
                    })

                    response.status(200).json({ msg: reservedBusArrInfo === null ? "운행 종료되었습니다." : "정상적으로 처리되었습니다.", item: reservedBusArrInfo });
                }
            } catch (error) {
                response.status(405).json({ msg: "지원하지 않는 메서드입니다.", item: null });
            }
            break;
        }
    }
}


interface ReservationDbResponse {
    _id: ObjectId;
    owner: string;
    arsId: string;
    busRouteId: string;
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
