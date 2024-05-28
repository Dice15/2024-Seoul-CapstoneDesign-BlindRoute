import { IForwarding } from "@/core/type/IForwarding";
import { IStationVisit } from "@/core/type/IStationVisit";
import IStation from "@/core/type/Station";
import axios from "axios";


type GetStationVisitResponse = {
    msg: string;
    data: {
        stationVisit: IStationVisit;
    };
};


export async function getStationVisit(forwarding?: IForwarding, busVehId?: string): Promise<{
    msg: string;
    data: {
        stationVisit: IStationVisit;
    };
}> {
    try {
        const response = await axios.get<GetStationVisitResponse>('/api/bus/getStationVisit', {
            params: {
                busRouteId: 100100019,//forwarding.busRouteId,
                busVehId: 123060251, //busVehId,
                stationSeq: 33, //start.seq,
                stopCount: 4,//destination.seq
            },
        });

        return response.data;
    }
    catch (error) {
        console.error(error);
        return {
            msg: "API 요청 중 오류가 발생했습니다.",
            data: {
                stationVisit: {
                    stationVisMsg: "운행종료",
                }
            }
        };
    }
}