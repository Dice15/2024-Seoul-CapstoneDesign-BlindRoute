import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import axios from 'axios';
import MongoDbProvider from '@/core/modules/database/MongoDbProvider';
import { ObjectId } from 'mongodb';


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const db = await MongoDbProvider.connectDb(process.env.BLINDROUTE_MONGODB_URI).then(() => MongoDbProvider.getDb());
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "GET": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", item: null });
                break;
            }

            try {
                const requestParam = request.query;
                const stationReservation = await axios.get<GetBusPosByVehIdApiResponse>(
                    "http://ws.bus.go.kr/api/rest/buspos/getBusPosByVehId",
                    {
                        params: {
                            serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING_KEY2),
                            vehId: requestParam.vehId,
                            resultType: "json"
                        }
                    }
                ).then(async (getBusPosByVehIdResponse) => {
                    const vehInfo = getBusPosByVehIdResponse.data.msgBody.itemList[0];
                    const destination = await axios.get<GetArrInfoByRouteAllApiResponse>(
                        "http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll",
                        {
                            params: {
                                serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING_KEY2),
                                busRouteId: requestParam.busRouteId,
                                resultType: "json"
                            }
                        }
                    ).then(async (getArrInfoByRouteAllResponse) => {
                        const stations = getArrInfoByRouteAllResponse.data.msgBody.itemList;
                        const currStationIdx = stations.findIndex((item) => item.stId === vehInfo.stId);
                        const nearbyStation = (await axios.get<GetStationByPosApiResponse>(
                            "http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos",
                            {
                                params: {
                                    serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING_KEY2),
                                    tmX: vehInfo.tmX,
                                    tmY: vehInfo.tmY,
                                    radius: 125,
                                    resultType: "json"
                                }
                            }
                        )).data.msgBody.itemList;
                        const nearbyDestination = nearbyStation === null ? undefined : nearbyStation.find((item) => item.arsId === stations[currStationIdx + 1].arsId);

                        return currStationIdx === -1 || currStationIdx >= stations.length - 1
                            ? undefined
                            : {
                                recentDestination: stations[currStationIdx],
                                currDestination: nearbyDestination,
                                nextDestination: nearbyDestination === undefined
                                    ? currStationIdx + 1 < stations.length ? stations[currStationIdx + 1].stNm : undefined
                                    : currStationIdx + 2 < stations.length ? stations[currStationIdx + 2].stNm : undefined
                            };
                    });

                    return destination === undefined
                        ? null
                        : destination.currDestination !== undefined
                            ? {
                                currStNm: destination.currDestination.stationNm,
                                nextStNm: destination.nextDestination,
                                currBoardingNum: (await db.collection("boarding_reservations").find<ReservationDbResponse>({ stId: destination.currDestination.stationId }).toArray()).length.toString(),
                                currAlightingNum: (await db.collection("alighting_reservations").find<ReservationDbResponse>({ stId: destination.currDestination.stationId }).toArray()).length.toString(),
                            }
                            : {
                                currStNm: destination.recentDestination.stNm,
                                nextStNm: destination.nextDestination,
                                currBoardingNum: (await db.collection("boarding_reservations").find<ReservationDbResponse>({ stId: destination.recentDestination.stId }).toArray()).length.toString(),
                                currAlightingNum: (await db.collection("alighting_reservations").find<ReservationDbResponse>({ stId: destination.recentDestination.stId }).toArray()).length.toString(),
                            }
                });

                response.status(200).json({ msg: "정상적으로 처리되었습니다.", item: stationReservation });

            } catch (error) {
                response.status(502).json({ msg: "API 요청 중 오류가 발생했습니다.", item: null });
            }
            break;
        }
        default: {
            response.status(405).json({ msg: "지원하지 않는 메서드입니다.", item: null });
            break;
        }
    }
}


interface ReservationDbResponse {
    _id: ObjectId;
    owner: string;
    arsId: string;
    busRouteId: string;
    reservationType: 'boarding' | 'alighting';
}


interface GetBusPosByVehIdApiResponse {
    comMsgHeader: ComMsgHeader;
    msgHeader: MsgHeader;
    msgBody: {
        itemList: BusPosition[];
    };
}


interface GetArrInfoByRouteAllApiResponse {
    comMsgHeader: ComMsgHeader;
    msgHeader: MsgHeader;
    msgBody: {
        itemList: BusStopInfo[];
    };
}


interface GetStationByPosApiResponse {
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


interface BusStopInfo {
    stId: string;
    stNm: string;
    arsId: string;
    busRouteId: string;
    rtNm: string;
    busRouteAbrv: string;
    firstTm: string;
    lastTm: string;
    term: string;
    routeType: string;
    nextBus: string;
    staOrd: string;
    dir: string;
    mkTm: string;
    vehId1: string;
    plainNo1: string;
    sectOrd1: string;
    stationNm1: string | null;
    traTime1: string;
    traSpd1: string;
    isArrive1: string;
    repTm1: string | null;
    isLast1: string;
    busType1: string;
    avgCf1: string;
    expCf1: string;
    kalCf1: string;
    neuCf1: string;
    exps1: string;
    kals1: string;
    neus1: string;
    rerdie_Div1: string;
    reride_Num1: string;
    brerde_Div1: string;
    brdrde_Num1: string;
    full1: string;
    nstnId1: string;
    nstnOrd1: string;
    nstnSpd1: string;
    nstnSec1: string;
    nmainStnid1: string;
    nmainOrd1: string;
    nmainSec1: string;
    nmain2Stnid1: string;
    nmain2Ord1: string;
    namin2Sec1: string;
    nmain3Stnid1: string;
    nmain3Ord1: string;
    nmain3Sec1: string;
    goal1: string;
    vehId2: string;
    plainNo2: string;
    sectOrd2: string;
    stationNm2: string | null;
    traTime2: string;
    traSpd2: string;
    isArrive2: string;
    repTm2: string | null;
    isLast2: string;
    busType2: string;
    avgCf2: string;
    expCf2: string;
    kalCf2: string;
    neuCf2: string;
    exps2: string;
    kals2: string;
    neus2: string;
    rerdie_Div2: string;
    reride_Num2: string;
    brerde_Div2: string;
    brdrde_Num2: string;
    full2: string;
    nstnId2: string;
    nstnOrd2: string;
    nstnSpd2: string;
    nstnSec2: string;
    nmainStnid2: string;
    nmainOrd2: string;
    nmainSec2: string;
    nmain2Stnid2: string;
    nmain2Ord2: string;
    namin2Sec2: string;
    nmain3Stnid2: string;
    nmain3Ord2: string;
    nmain3Sec2: string;
    goal2: string;
    arrmsg1: string;
    arrmsg2: string;
    deTourAt: string;
}


interface StationInfo {
    stationId: string;
    stationNm: string;
    gpsX: string;
    gpsY: string;
    posX: string;
    posY: string;
    stationTp: string;
    arsId: string;
    dist: string;
}