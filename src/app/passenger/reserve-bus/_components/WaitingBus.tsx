"use client"

import { Bus } from "@/core/type/Bus";
import { ReserveBusStep } from "./ReserveBus";
import { useEffect, useRef, useState } from "react";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { cancelReservation, getDestinationByRoute, getReservedBusArrInfo } from "@/core/api/blindrouteApi";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import styled from "styled-components";
import { Station } from "@/core/type/Station";
import { useSwipeable } from "react-swipeable";


interface WaitingBusProps {
    setReserveStep: React.Dispatch<React.SetStateAction<{ prev: ReserveBusStep; curr: ReserveBusStep; }>>;
    reservedBus: {
        station: Station;
        bus: Bus;
        reservationId: string;
    };
    setBoardingVehId: React.Dispatch<React.SetStateAction<string | null>>;
    setDestinations: React.Dispatch<React.SetStateAction<Station[]>>;
}


export default function WaitingBus({ setReserveStep, reservedBus, setBoardingVehId, setDestinations }: WaitingBusProps) {
    // States
    const [isLoading, setIsLoading] = useState(false);
    const [busArrInfo, setBusArrInfo] = useState<{ arrmsg: string; vehId: string; } | null>(null);


    // Ref
    const focusBlankRef = useRef<HTMLDivElement>(null);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "arrivalInfo") => {
        switch (type) {
            case "arrivalInfo": {
                const extractTimeInfo = (arrmsg: string) => {
                    const timePattern = /\d+분\d+초후|곧 도착/; // '1분56초후' 또는 '곧 도착'을 찾는 정규 표현식
                    const match = arrmsg.match(timePattern);
                    return match ? match[0] : ""; // 일치하는 부분을 반환하거나, 일치하는 부분이 없으면 null을 반환
                }

                const currInfo = busArrInfo ? extractTimeInfo(busArrInfo.arrmsg) : "";
                const arrMsg = currInfo === "" ? "" : `${currInfo}${currInfo === "곧 도착" ? "" : "에 도착"}합니다.`;
                SpeechOutputProvider.speak(`"${reservedBus.bus.busRouteAbrv}",  "${reservedBus.bus.adirection} 방면" 버스를 대기중입니다. ${arrMsg}`);
                break;
            }
        }
    }


    /** 버스 예약 취소 */
    const handleCancelReservation = () => {
        cancelReservation().then(({ msg, deletedCount }) => {
            setIsLoading(false);
            setReserveStep({
                prev: "waitingBus",
                curr: "selectBus"
            });
        });
    }


    /** 버스 도착하면 예약을 삭제하고 해당 버스의 도착지를 받아옴 */
    const handleArrivedBus = () => {
        cancelReservation().then(({ msg, deletedCount }) => {
            getDestinationByRoute(reservedBus.bus.busRouteId, busArrInfo!.vehId).then(({ msg, itemList }) => {
                setIsLoading(false);
                if (msg === "정상적으로 처리되었습니다." && itemList.length > 0) {
                    const stIdx = itemList.findIndex((item) => item.stNm === reservedBus.station.stNm);
                    setDestinations(itemList.slice(stIdx));
                }
                setReserveStep({
                    prev: "waitingBus",
                    curr: "arrivalBus"
                });
            });
        });
    }


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedRight: () => {
            setIsLoading(true);
            handleCancelReservation();
        },
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = () => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("arrivalInfo");
    };


    /** 예약한 버스가 도착했는지 2초마다 확인함 */
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const newArrInfo = (await getReservedBusArrInfo(reservedBus.reservationId)).busArrInfo;
            if (newArrInfo !== null) {
                if (busArrInfo !== null) {
                    if (newArrInfo.vehId !== busArrInfo.vehId) {
                        setIsLoading(true);
                        handleArrivedBus();
                    } else {
                        setBoardingVehId(newArrInfo.vehId);
                        setBusArrInfo(newArrInfo);
                    }
                } else {
                    setBusArrInfo(newArrInfo);
                }
            } else {
                if (busArrInfo !== null) {
                    setIsLoading(true);
                    handleArrivedBus();
                }
            }
        }, 2000);

        return () => {
            clearInterval(intervalId);
        }
    }, [reservedBus, busArrInfo, setIsLoading, setBusArrInfo, setBoardingVehId]);


    useEffect(() => {
        if (focusBlankRef.current) {
            focusBlankRef.current.focus();
        }
    }, []);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <FocusBlank ref={focusBlankRef} tabIndex={0} />
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
            >
                <BusName>{reservedBus.bus.busRouteAbrv || reservedBus.bus.busRouteNm}</BusName>
                <WiatingMessage>{"대기중"}</WiatingMessage>
            </ReservationContainer>
        </Wrapper >
    );
}


const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;


const FocusBlank = styled.div`
`;


const ReservationContainer = styled.div`
    height: 90%;
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
    display: flex;
    flex-direction: column; 
    justify-content: center;
    align-items: center;
`;


const BusName = styled.h1` 
    text-align: center;
    margin-bottom: 4vw;
    font-size: 6.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;


const WiatingMessage = styled.h3`
    text-align: center;
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;
