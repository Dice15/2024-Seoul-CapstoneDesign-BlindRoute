import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import axios from 'axios';


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "GET": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", item: null });
                break;
            }

            try {
                const requestParam = request.query;
                const responseData = await axios.get<GetBusPosByVehIdApiResponse>(
                    "http://ws.bus.go.kr/api/rest/buspos/getBusPosByVehId",
                    {
                        params: {
                            serviceKey: decodeURIComponent(process.env.DATA_API_ENCODING),
                            stSrch: requestParam.vehId,
                            resultType: "json"
                        }
                    }
                );
                const { comMsgHeader, msgHeader, msgBody } = responseData.data;

                if (comMsgHeader.errMsg) {
                    response.status(500).json({ msg: msgHeader.headerMsg, item: null });
                } else {
                    response.status(200).json({ msg: msgHeader.headerMsg, item: { stId: msgBody.itemList[0].stId, stopFlag: msgBody.itemList[0].stopFlag } });
                }
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


interface GetBusPosByVehIdApiResponse {
    comMsgHeader: ComMsgHeader;
    msgHeader: MsgHeader;
    msgBody: {
        itemList: BusPosition[];
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