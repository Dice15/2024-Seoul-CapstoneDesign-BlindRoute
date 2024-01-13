"use client"

import LoadingAnimation from "@/app/_components/LoadingAnimation";
import styled from "styled-components";
import { ReserveBusStep } from "./ReserveBus";
import { Station } from "@/core/type/Station";
import { Bus } from "@/core/type/Bus";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";
import useTouchEvents from "@/core/hooks/useTouchEvents";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { useEffect, useState } from "react";


interface ArrivalBusProps {
    setReserveStep: React.Dispatch<React.SetStateAction<{ prev: ReserveBusStep; curr: ReserveBusStep; }>>;
    reservedBus: {
        station: Station;
        bus: Bus;
        reservationId: string;
    };
}


export default function ArrivalBus({ setReserveStep, reservedBus }: ArrivalBusProps) {
    // Const
    const router = useRouter();


    // States
    const [isLoading, setIsLoading] = useState(false);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "arrivalInfo") => {
        //return;
        switch (type) {
            case "arrivalInfo": {
                SpeechOutputProvider.speak(`"${reservedBus.bus.busRouteAbrv || reservedBus.bus.busRouteNm}" 버스가 도착했습니다!`);
                break;
            }
        }
    }


    /** 이전 단계로 이동 */
    const handleBackToHome = () => {
        setIsLoading(false);
        router.replace("./");
    }


    /** 하차 등록 단계로 이동 */
    const handleGoNextStep = () => {
        setIsLoading(false);
        setReserveStep({
            prev: "arrivalBus",
            curr: "selectDestination"
        });
    }


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: () => {
            setIsLoading(true);
            handleGoNextStep();
        },
        onSwipedRight: () => {
            setIsLoading(true);
            handleBackToHome();
        },
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = useTouchEvents({
        onSingleTouch: () => {
            VibrationProvider.vibrate(1000);
            handleAnnouncement("arrivalInfo");
        },
        onDoubleTouch: () => {
            VibrationProvider.repeatVibrate(500, 200, 2);
            setIsLoading(true);
            handleGoNextStep();
        },
    });


    // Effects
    useEffect(() => {
        VibrationProvider.vibrate(5000);
        setTimeout(() => { handleAnnouncement("arrivalInfo"); }, 400);
        setTimeout(() => { setIsLoading(true); handleGoNextStep(); }, 10000);
    }, [reservedBus]);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
            >
                <BusName>{reservedBus.bus.busRouteAbrv || reservedBus.bus.busRouteNm}</BusName>
                <ArrivalMessage>{"버스가 도착했습니다!"}</ArrivalMessage>
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


const ArrivalMessage = styled.h3` 
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;
