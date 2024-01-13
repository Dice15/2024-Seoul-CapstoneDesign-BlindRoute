"use client"

import LoadingAnimation from "@/app/_components/LoadingAnimation";
import useTouchEvents from "@/core/hooks/useTouchEvents";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { Station } from "@/core/type/Station";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import styled from "styled-components";


interface ArrivalDestinationProps {
    selectedDestination: Station;
}


export default function ArrivalDestination({ selectedDestination }: ArrivalDestinationProps) {
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
                SpeechOutputProvider.speak(`"${selectedDestination.stNm}", "${selectedDestination.stDir} 방면" 정류장에 도착했습니다.`);
                break;
            }
        }
    }


    /** 이전 단계로 이동 */
    const handleBackToHome = () => {
        setIsLoading(false);
        router.replace("./");
    }


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: () => {
            setIsLoading(true);
            handleBackToHome();
        },
        onSwipedRight: () => {
            setIsLoading(true);
            handleBackToHome();
        },
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = () => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("arrivalInfo");
    }


    // Effects
    useEffect(() => {
        VibrationProvider.vibrate(5000);
        setTimeout(() => { handleAnnouncement("arrivalInfo"); }, 400);
        setTimeout(() => { setIsLoading(true); handleBackToHome(); }, 10000);
    }, [selectedDestination]);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
            >
                <ReservationDestinationName>{selectedDestination.stNm}</ReservationDestinationName>
                <ArrivalMessage>{"정류장에 도착했습니다!"}</ArrivalMessage>
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


const ReservationDestinationName = styled.h1` 
    font-size: 6.5vw;
    margin-bottom: 4vw;
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
