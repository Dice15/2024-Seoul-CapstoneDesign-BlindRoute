"use client"

import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { Station } from "@/core/type/Station";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import styled from "styled-components";


interface ArrivalDestinationProps {
    selectedDestination: Station;
}


export default function ArrivalDestination({ selectedDestination }: ArrivalDestinationProps) {
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
                        SpeechOutputProvider.speak(`"${selectedDestination.stNm}", "${selectedDestination.stDir} 방면" 정류장에 도착했습니다! 10초 뒤 홈 페이지로 이동합니다.`);
                        setIsFirstAnnouncement(false);
                    }, delay)
                } else {
                    SpeechOutputProvider.speak(`"${selectedDestination.stNm}", "${selectedDestination.stDir} 방면" 정류장에 도착했습니다! 잠시 후 홈 페이지로 이동합니다.`);
                }
                break;
            }
        }
    }, [isFirstAnnouncement, selectedDestination.stDir, selectedDestination.stNm]);


    /** 이전 단계로 이동 */
    const handleBackToHome = useCallback(() => {
        setIsLoading(false);
        router.replace("./");
    }, [router]);


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: useCallback(() => {
            setIsLoading(true);
            handleBackToHome();
        }, [handleBackToHome]),
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
            handleBackToHome();
        }, 10000);

        return () => clearTimeout(timer);
    }, [handleBackToHome]);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
                tabIndex={1}
            >
                <ReservationDestinationName>{selectedDestination.stNm}</ReservationDestinationName>
                <ArrivalMessage>{"정류장에 도착했습니다!"}</ArrivalMessage>
            </ReservationContainer>
            <FocusBlank ref={focusBlankRef} tabIndex={0} />
        </Wrapper >
    );
}


const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    flex-direction: column;
    display: flex;
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
