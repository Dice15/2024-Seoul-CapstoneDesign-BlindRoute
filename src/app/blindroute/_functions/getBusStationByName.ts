import IStation, { Station } from "@/core/type/Station";
import axios from "axios";


type getBusStationResponse = {
    msg: string;
    data: {
        stations: IStation[];
    };
};


export async function getBusStation(stationName: string): Promise<{
    msg: string;
    data: {
        stations: Station[];
    };
}> {
    try {
        const response = await axios.get<getBusStationResponse>('/api/station/getBusStationByName', {
            params: { stationName },
        });

        return {
            msg: response.data.msg,
            data: { stations: response.data.data.stations.map((item) => Station.fromObject(item)) }
        };
    } catch (error) {
        console.error(error);
        return {
            msg: "API 요청 중 오류가 발생했습니다.",
            data: { stations: [] }
        };
    }
}