import { IRouting } from "@/core/type/IRouting";
import { Station } from "@/core/type/Station";
import axios from "axios";


type GetRouteResponse = {
    msg: string;
    data: IRouting;
};


export async function getRoute(start?: Station, destination?: Station): Promise<{
    msg: string;
    data: IRouting;
}> {
    try {
        const response = await axios.get<GetRouteResponse>('/api/route/getRouteByLocation', {
            params: {
                startX: "127.0507436148",//start.tmX,
                startY: "37.653177207",//start.tmY,
                destinationX: "126.9947285429",//destination.tmX,
                destinationY: "37.5612375854",//destination.tmY,
            },
        });

        return response.data;
    } catch (error) {
        console.error(error);
        return {
            msg: "API 요청 중 오류가 발생했습니다.",
            data: {
                fare: "",
                time: "",
                forwarding: []
            }
        }
    };
}