"use client"

import LoadingAnimation from "@/app/_components/LoadingAnimation";
import styled from "styled-components";
import { ReserveBusStep } from "./ReserveBus";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { Boarding } from "@/core/type/Boarding";


interface ArrivalBusProps {
    setStep: React.Dispatch<React.SetStateAction<ReserveBusStep>>;
    boarding: Boarding;
}


export default function ArrivalBus({ setStep, boarding }: ArrivalBusProps) {
    // Const
    const router = useRouter();


    // Ref
    const focusBlankRef = useRef<HTMLDivElement>(null);


    // States
    const [isFirstAnnouncement, setIsFirstAnnouncement] = useState(true);
    const [isLoading, setIsLoading] = useState(false);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = useCallback((type: "arrivalInfo") => {
        switch (type) {
            case "arrivalInfo": {
                if (isFirstAnnouncement) {
                    const delay = 700;
                    for (let i = 0; i < delay; i += 50) {
                        setTimeout(() => { SpeechOutputProvider.speak(" "); }, i);
                    }
                    setTimeout(() => {
                        SpeechOutputProvider.speak(`"${boarding.bus.busRouteAbrv || boarding.bus.busRouteNm}", "${boarding.bus.adirection} 방면" 버스가 도착했습니다! 10초 뒤 목적지 선택 페이지로 이동합니다.`);
                        setIsFirstAnnouncement(false);
                    }, delay)
                } else {
                    SpeechOutputProvider.speak(`"${boarding.bus.busRouteAbrv || boarding.bus.busRouteNm}", "${boarding.bus.adirection} 방면" 버스가 도착했습니다! 잠시 후 목적지 선택 페이지로 이동합니다.`);
                }
                break;
            }
        }
    }, [boarding.bus.adirection, boarding.bus.busRouteAbrv, boarding.bus.busRouteNm, isFirstAnnouncement]);


    /** 이전 단계로 이동 */
    const handleBackToHome = useCallback(() => {
        setIsLoading(false);
        router.replace("../");
    }, [router]);


    /** 하차 등록 단계로 이동 */
    const handleGoNextStep = useCallback(() => {
        setIsLoading(false);
        setStep("selectDestination");
    }, [setStep]);


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: useCallback(() => {
            setIsLoading(true);
            handleGoNextStep();
        }, [handleGoNextStep]),
        onSwipedRight: useCallback(() => {
            setIsLoading(true);
            handleBackToHome();
        }, [handleBackToHome]),
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = useCallback(() => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("arrivalInfo");
    }, [handleAnnouncement]);


    // Effects
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


    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(true);
            handleGoNextStep();
        }, 10000);

        return () => clearTimeout(timer);
    }, [handleGoNextStep]);



    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
                tabIndex={1}
            >
                <BusName>{boarding.bus.busRouteAbrv || boarding.bus.busRouteNm}</BusName>
                <ArrivalMessage>{"버스가 도착했습니다!"}</ArrivalMessage>
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


const ArrivalMessage = styled.h3` 
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;
