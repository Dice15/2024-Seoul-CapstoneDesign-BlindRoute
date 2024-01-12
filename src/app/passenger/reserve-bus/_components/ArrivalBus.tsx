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


export interface ArrivalBusProps {
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
    const handleAnnouncement = (type: "guide") => {
        //return;
        switch (type) {
            case "guide": {
                SpeechOutputProvider.speak(`"${reservedBus.bus.busRouteAbrv || reservedBus.bus.busRouteNm}" 버스가 도착했습니다! 화면을 두번 터치하면 승차 완료 처리가 됩니다.`);
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
            prev: "arrival",
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
            handleAnnouncement("guide");
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
        setTimeout(() => { handleAnnouncement("guide"); }, 400);
    }, [reservedBus]);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
            >
                <ReservationBusName>{reservedBus.bus.busRouteAbrv || reservedBus.bus.busRouteNm}</ReservationBusName>
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


const ReservationBusName = styled.h1` 
    font-size: 7vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const ArrivalMessage = styled.h3` 
    font-size: 5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;
