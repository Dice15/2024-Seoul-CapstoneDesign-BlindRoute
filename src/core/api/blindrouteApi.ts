/*****************************************************************
 * API URL을 구성하고 반환하는 메서드입니다.
 *****************************************************************/

import axios from "axios";
import IStation, { Station } from "../type/Station";
import IBus, { Bus } from "../type/Bus";

/**
 * getApiUrl 메서드는 기본 URL에 API 경로를 추가하여 완성된 API URL을 반환합니다.
 * @param path API 경로입니다.
 * @returns {string} 구성된 API URL을 반환합니다.
 */
function getApiUrl(path: string): string {
    const apiUrl = `${path}`;
    const now = new Date();
    const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}:${now.getMilliseconds().toString().padStart(3, '0')}`;
    //console.log(`[${formattedTime}] request: ${apiUrl}`);
    return apiUrl;
}





/*****************************************************************
 * Axios 요청에 사용될 기본 타임아웃 값을 반환하는 메서드입니다.
 *****************************************************************/

/**
 * `getDefualtAxiosTimeout` 메서드는 Axios HTTP 요청의 기본 타임아웃 값을 설정합니다.
 * 현재 이 메서드는 10초(10000 밀리초)로 타임아웃을 설정하여 반환합니다.
 * 이 값을 사용하여 Axios 요청 시 기본적으로 설정할 타임아웃 값을 지정할 수 있습니다.
 *
 * @returns {number} 기본 타임아웃 값인 10000(10초)을 반환합니다.
 */
function getDefualtAxiosTimeout(): number {
    return 10000;
}





/*****************************************************************
 * 버스 정류장 정보를 가져오는 API 메서드입니다.
*****************************************************************/

/** 버스 정류장 정보 응답 데이터 타입 */
type GetStationsResponse = {
    msg: string;
    itemList: IStation[];
};

/**
 * 서버에서 버스 정류장 정보를 가져옵니다.
 * @param stationName 검색할 정류장 이름
 * @returns {Promise<GetStationsResponse>} 
 * StationInfo 배열과 처리 결과 메시지를 포함하는 객체를 반환합니다.
 * 요청이 실패하면 빈 배열과 "FAIL" 메시지를 반환합니다.
 */
export async function getStations(stationName: string): Promise<{
    msg: string;
    itemList: Station[];
}> {
    try {
        const response = await axios.get<GetStationsResponse>(
            getApiUrl(`/api/stationinfo/getStationByName`),
            {
                params: { stationName },
            }
        );

        const { msg, itemList } = response.data;
        return {
            msg: msg,
            itemList: itemList.map((item) => Station.fromObject(item))
        };
    } catch (error) {
        return {
            msg: "API 요청 중 오류가 발생했습니다.",
            itemList: []
        };
    }
}





/*****************************************************************
 * 특정 정류장에 서비스되는 버스 목록을 가져오는 API 메서드입니다.
*****************************************************************/

/** 버스 목록 응답 데이터 타입 */
type GetBusesResponse = {
    msg: string;
    itemList: IBus[];
};

/**
 * 서버에서 특정 정류장의 버스 목록을 가져옵니다.
 * @param arsId 정류장 고유 아이디(ARS 번호)
 * @returns {Promise<{ msg: string; itemList: Bus[]; }>} 
 * Bus 객체 배열과 처리 결과 메시지를 포함하는 객체를 반환합니다.
 * 요청이 실패하면 빈 배열과 오류 메시지를 반환합니다.
 */
export async function getBuses(arsId: string): Promise<{
    msg: string;
    itemList: Bus[];
}> {
    try {
        // 서버로부터 버스 목록 데이터를 요청합니다.
        const response = await axios.get<GetBusesResponse>(
            getApiUrl(`/api/stationinfo/getRouteByStationList`),
            {
                params: { arsId },
            }
        );

        // 요청에 성공했을 때, 응답 데이터에서 메시지와 버스 목록을 추출합니다.
        const { msg, itemList } = response.data;
        return {
            msg: msg,
            // IBus 객체 배열을 Bus 클래스 인스턴스 배열로 변환합니다.
            itemList: itemList.map((item) => Bus.fromObject(item))
        };
    } catch (error) {
        // 요청 중 오류가 발생하면 오류 메시지와 빈 배열을 반환합니다.
        return {
            msg: "API 요청 중 오류가 발생했습니다.",
            itemList: []
        };
    }
}





/*****************************************************************
 * 버스 예약을 하는 API 메서드입니다.
*****************************************************************/

/** 버스 예약 응답 데이터 타입 */
type ReserveBusResponse = {
    msg: string;
    reservationId: string | null;
};

/**
 * 서버에 버스 예약을 요청합니다.
 * @param arsId 정류장 고유 아이디(ARS 번호)
 * @param busRouteId 버스 노선 ID
 * @returns {Promise<ReserveBusResponse>}
 * 예약 결과 메시지와 예약 ID를 포함하는 객체를 반환합니다.
 * 요청이 실패하면 null과 "FAIL" 메시지를 반환합니다.
 */
export async function reserveBus(arsId: string, busRouteId: string): Promise<{
    msg: string;
    reservationId: string | null;
}> {
    try {
        const response = await axios.post<ReserveBusResponse>(
            getApiUrl(`/api/stationinfo/reserveBusAtStation`),
            {
                arsId,
                busRouteId
            }
        );

        const { msg, reservationId } = response.data;
        return {
            msg: msg,
            reservationId: reservationId
        };
    } catch (error) {
        return {
            msg: "예약 요청 중 오류가 발생했습니다.",
            reservationId: null
        };
    }
}





/*****************************************************************
 * 버스 예약을 취소하는 API 메서드입니다.
*****************************************************************/

/** 버스 예약 취소 응답 데이터 타입 */
type CancelReservationResponse = {
    msg: string;
    deletedCount: number | null;
};

/**
 * 서버에 버스 예약 취소를 요청합니다.
 * @param reservationId 예약 ID
 * @returns {Promise<CancelReservationResponse>}
 * 취소 결과 메시지와 취소된 예약 수를 포함하는 객체를 반환합니다.
 * 요청이 실패하면 null과 "FAIL" 메시지를 반환합니다.
 */
export async function cancelReservation(): Promise<{
    msg: string;
    deletedCount: number | null;
}> {
    try {
        const response = await axios.delete<CancelReservationResponse>(
            getApiUrl(`/api/stationinfo/reserveBusAtStation`)
        );

        const { msg, deletedCount } = response.data;
        return {
            msg: msg,
            deletedCount: deletedCount
        };
    } catch (error) {
        return {
            msg: "예약 취소 요청 중 오류가 발생했습니다.",
            deletedCount: null
        };
    }
}























type TestDelayResponse = {
    message: "SUCCESS" | "FAIL";
};

export async function testDelay(): Promise<{
    message: "SUCCESS" | "FAIL";
}> {
    let responseData: TestDelayResponse = { message: "FAIL" };
    try {
        const response = await axios.get(
            getApiUrl(`/api/test/delay`),
            {
                timeout: getDefualtAxiosTimeout(),
            }
        );
        responseData = response.data;
    } catch (error) {
        return { message: "FAIL" }
    }
    return { message: responseData.message }
}