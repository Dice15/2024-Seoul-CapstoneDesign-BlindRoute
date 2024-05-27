import { IBusArrival } from "@/core/type/IBusArrival";
import { IForwarding } from "@/core/type/IForwarding";
import axios from "axios";


type GetBusArrivalResponse = {
    msg: string;
    data: {
        busArrival: IBusArrival;
    };
};


export async function getBusArrival(forwarding?: IForwarding): Promise<{
    msg: string;
    data: {
        busArrival: IBusArrival;
    };
}> {
    try {
        const response = await axios.get<GetBusArrivalResponse>('/api/station/getBusArrival', {
            params: {
                stationArsId: "10011",//forwarding.stationArsId,
                busRouteId: "100100012",//forwarding.busRouteId
            },
        });

        return response.data;
    }
    catch (error) {
        console.error(error);
        return {
            msg: "API 요청 중 오류가 발생했습니다.",
            data: {
                busArrival: {
                    busArrMsg1: "운행종료",
                    busVehId1: "",
                    busArrMsg2: "운행종료",
                    busVehId2: "",
                }
            }
        };
    }
}