"use client"

import { ReserveBusStep } from "./ReserveBus";
import { useCallback, useEffect, useRef, useState } from "react";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { cancelReservation, getDestinationByRoute, getReservedBusArrInfo } from "@/core/api/blindrouteApi";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import styled from "styled-components";
import { Station } from "@/core/type/Station";
import { useSwipeable } from "react-swipeable";
import { Boarding, BoardingBuilder } from "@/core/type/Boarding";


interface WaitingBusProps {
    setStep: React.Dispatch<React.SetStateAction<ReserveBusStep>>;
    boarding: Boarding;
    setBoarding: React.Dispatch<React.SetStateAction<Boarding | null>>;
    setDestinations: React.Dispatch<React.SetStateAction<Station[]>>;
}


interface BusArrivalInfo {
    arrmsg: string;
    vehId: string;
}


export default function WaitingBus({ setStep, boarding, setBoarding, setDestinations }: WaitingBusProps) {
    // States
    const [isFirstCheckArrival, setIsFirstCheckArrival] = useState(true);
    const [isFirstAnnouncement, setIsFirstAnnouncement] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [busArrInfo, setBusArrInfo] = useState<BusArrivalInfo | null>(null);


    // Ref
    const focusBlankRef = useRef<HTMLDivElement>(null);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = useCallback((type: "arrivalInfo") => {
        switch (type) {
            case "arrivalInfo": {
                const extractTimeInfo = (arrmsg: string) => {
                    const timePattern = /\d+분\d+초후|곧 도착/; // '1분56초후' 또는 '곧 도착'을 찾는 정규 표현식
                    const match = arrmsg.match(timePattern);
                    return match ? match[0] : ""; // 일치하는 부분을 반환하거나, 일치하는 부분이 없으면 null을 반환
                }

                const currInfo = busArrInfo ? extractTimeInfo(busArrInfo.arrmsg) : "";
                const arrMsg = currInfo === "" ? "" : `${currInfo}${currInfo === "곧 도착" ? "" : "에 도착"}합니다.`;

                if (isFirstAnnouncement) {
                    const delay = 700;
                    for (let i = 0; i < delay; i += 50) {
                        setTimeout(() => { SpeechOutputProvider.speak(" "); }, i);
                    }
                    setTimeout(() => {
                        const guide = isFirstAnnouncement ? "버스를 대기 중입니다. 화면을 터치하면 버스 도착까지 남은 시간을 알 수 있습니다." : "";
                        SpeechOutputProvider.speak(`${guide} "${boarding.bus.busRouteAbrv}",  "${boarding.bus.adirection} 방면" 버스를 대기중입니다. ${arrMsg}`);
                        setIsFirstAnnouncement(false);
                    }, delay)
                } else {
                    SpeechOutputProvider.speak(`"${boarding.bus.busRouteAbrv}",  "${boarding.bus.adirection} 방면" 버스를 대기중입니다. ${arrMsg}`);
                }
                break;
            }
        }
    }, [boarding.bus.adirection, boarding.bus.busRouteAbrv, busArrInfo, isFirstAnnouncement]);


    /** 버스 예약 취소 */
    const handleCancelReservation = useCallback(() => {
        cancelReservation().then(({ msg, deletedCount }) => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
            }

            setTimeout(() => {
                SpeechOutputProvider.speak("버스 예약을 취소하였습니다.").then(() => {
                    setIsLoading(false);
                    setStep("selectBus");
                });
            }, 200);
        });
    }, [setStep]);


    /** 버스 도착하면 예약을 삭제하고 해당 버스의 도착지를 받아옴 */
    const handleArrivedBus = useCallback(() => {
        cancelReservation().then(({ msg, deletedCount }) => {
            getDestinationByRoute(boarding.bus.busRouteId, busArrInfo!.vehId).then(({ msg, itemList }) => {
                if (msg === "정상적으로 처리되었습니다." && itemList.length > 0) {
                    const stIdx = itemList.findIndex((item) => item.stNm === boarding.station.stNm);
                    setDestinations(itemList.slice(stIdx));
                }
                setTimeout(() => {
                    setIsLoading(false);
                    setStep("arrivalBus");
                }, 1000);
            });
        });
    }, [boarding.bus.busRouteId, boarding.station.stNm, busArrInfo, setDestinations, setStep]);


    /** 버스 도착 확인 */
    const handleCheckBusArrival = useCallback(async () => {
        const newArrInfo = (await getReservedBusArrInfo(boarding.reservationId)).busArrInfo;
        if (newArrInfo !== null) {
            if (busArrInfo !== null) {
                if (newArrInfo.vehId !== busArrInfo.vehId) {
                    setIsLoading(true);
                    handleArrivedBus();
                } else {
                    setBoarding(new BoardingBuilder(boarding.station, boarding.bus)
                        .vehId(newArrInfo.vehId)
                        .reservationId(boarding.reservationId)
                        .build());
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
    }, [boarding.bus, boarding.reservationId, boarding.station, busArrInfo, handleArrivedBus, setBoarding]);


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedRight: useCallback(() => {
            setIsLoading(true);
            handleCancelReservation();
        }, [handleCancelReservation]),
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = useCallback(() => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("arrivalInfo");
    }, [handleAnnouncement]);



    /* Effect  */
    /** 랜더링 시 포커스 지정 */
    useEffect(() => {
        if (focusBlankRef.current) {
            focusBlankRef.current.focus();
        }
    }, []);


    /** 랜더링 시 페이지 안내음성 */
    useEffect(() => {
        if (isFirstAnnouncement) {
            handleAnnouncement("arrivalInfo");
        }
    }, [isFirstAnnouncement, handleAnnouncement])


    /** 첫번쨰 랜더링일 때는 바로 버스 도착정보를 체크함 */
    useEffect(() => {
        if (isFirstCheckArrival) {
            handleCheckBusArrival();
            setIsFirstCheckArrival(false);
        }
    }, [isFirstCheckArrival, setIsFirstCheckArrival, handleCheckBusArrival]);


    /** 예약한 버스가 도착했는지 12초마다 확인함 */
    useEffect(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        intervalIdRef.current = setInterval(handleCheckBusArrival, 12000);

        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        }
    }, [handleCheckBusArrival]);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
                tabIndex={1}
            >
                <BusName>{boarding.bus.busRouteAbrv || boarding.bus.busRouteNm}</BusName>
                <WiatingMessage>{"버스 대기중"}</WiatingMessage>
            </ReservationContainer>
            <FocusBlank ref={focusBlankRef} tabIndex={0} />
        </Wrapper >
    );
}


const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;


const FocusBlank = styled.div`
    height:0px;
    width: 85%;
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
