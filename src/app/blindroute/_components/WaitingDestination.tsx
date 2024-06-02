"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import 'swiper/css';
import styled from "styled-components";
import { PathFinderStep } from "./PathFinder";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { IForwarding } from "@/models/IForwarding";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { IStationVisit } from "@/models/IStationVisit";
import { getStationVisit } from "../_functions/getStationVisit";
import { useRouter } from "next/navigation";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import Image from "next/image";
import { stationSpeakHelper } from "../_functions/stationSpeakHelper";


interface WaitingDesProps {
    setStep: React.Dispatch<React.SetStateAction<PathFinderStep>>;
    forwarding: IForwarding | null;
    setForwardIndex: React.Dispatch<React.SetStateAction<number>>;
    onBoardVehId: string | null;
    lastForwarding: boolean;
}


export default function WaitingDestination({ setStep, forwarding, setForwardIndex, onBoardVehId, lastForwarding }: WaitingDesProps) {
    // hook
    const router = useRouter();


    // ref
    const WaitingDesInfoContainerRef = useRef<HTMLDivElement>(null);
    const focusBlank = useRef<HTMLDivElement>(null);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);


    // state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [stationVisit, setStationVisit] = useState<IStationVisit | null>(null);
    const [displayPageGuide, setDisplayPageGuide] = useState<boolean>(false);


    // handler
    const handleGoBack = useCallback(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
        }

        SpeechOutputProvider.speak("정류장 하차을 취소하였습니다.").then(() => {
            setStep("reservationDesConfirm");
        });

    }, [setStep]);


    const handleGoNext = useCallback(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
        }

        VibrationProvider.vibrate(8000);
        if (lastForwarding) {
            SpeechOutputProvider.speak('정류장에 도착했습니다.')
                .then(async () => { await await SpeechOutputProvider.speak(`최종 목적지 ${stationSpeakHelper(forwarding?.toStationNm || "")}에 도착했습니다.`) })
                .then(async () => { await SpeechOutputProvider.speak("경로 탐색을 종료하고 챗봇으로 돌아갑니다.") })
                .then(() => { router.replace('/chatbot') });
        }
        else {
            setTimeout(() => {
                setForwardIndex(prev => prev + 1);
                setStep("reservationBusConfirm");
            }, 8000);
            SpeechOutputProvider.speak("정류장에 도착했습니다.");
        }

    }, [setStep, forwarding, setForwardIndex, lastForwarding, router]);


    const handlePageGuideOpen = useCallback(() => {
        setDisplayPageGuide(true);
    }, []);


    const handlePageGuideClose = useCallback(() => {
        setDisplayPageGuide(false);
    }, []);


    const handleHorizontalSwipe = useSwipeable({
        onSwipedLeft: useCallback(() => {
            handleGoNext();
        }, [handleGoNext]),
        onSwipedRight: useCallback(() => {
            handleGoBack()
        }, [handleGoBack]),
        trackMouse: true
    });


    const handleSpeak = useCallback((init: boolean, forwarding: IForwarding, stationVisit: IStationVisit) => {
        const text = `
            ${stationSpeakHelper(forwarding.toStationNm)} 로 이동 중 입니다.
            ${stationVisit.stationVisMsg}.
            ${init ? "오른쪽으로 스와이프하면 정류장 하차 예약을 취소합니다." : ""}     
        `;
        return SpeechOutputProvider.speak(text);
    }, []);


    const handleTouch = useCallback(() => {
        if (forwarding && stationVisit) {
            handleSpeak(false, forwarding, stationVisit);
        }
    }, [forwarding, stationVisit, handleSpeak]);


    const handleCheckStationVisit = useCallback(async () => {
        if (!forwarding || !onBoardVehId) return;
        getStationVisit(forwarding, onBoardVehId).then((newStationVisit) => {
            if (newStationVisit.data.stationVisit.stationVisMsg === "목적지에 도착했습니다.") {
                handleGoNext();
            } else {
                setStationVisit(newStationVisit.data.stationVisit);
            }
        });
    }, [forwarding, handleGoNext, onBoardVehId]);


    // effect
    useEffect(() => {
        VibrationProvider.vibrate(500);
    }, []);


    useEffect(() => {
        if (isLoading && forwarding && stationVisit) {
            setIsLoading(false);
            handleSpeak(false, forwarding, stationVisit);
        }
    }, [forwarding, isLoading, stationVisit, handleSpeak]);


    useEffect(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }

        if (isLoading) {
            handleCheckStationVisit();
        }
        intervalIdRef.current = setInterval(handleCheckStationVisit, 15000);

        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        }
    }, [isLoading, handleCheckStationVisit])


    // render
    return (
        <Wrapper {...handleHorizontalSwipe}>
            {displayPageGuide &&
                <PageGuideImage onClick={handlePageGuideClose}>
                    <Image src="/images/blindroute_page_guide_waiting_destination.png" alt="page_guide" fill priority />
                </PageGuideImage>
            }
            <LoadingAnimation active={isLoading} />
            <WaitingDesInfoContainer ref={WaitingDesInfoContainerRef}>
                <PageGuideButton onClick={handlePageGuideOpen}>
                    {'ⓘ 사용 가이드 (보호자 전용)'}
                </PageGuideButton>
                <WaitingDesInfo onClick={handleTouch}>
                    {forwarding && <>
                        <ReservationType>
                            {'(버스 하차 대기)'}
                        </ReservationType>
                        <StationName>
                            {`${forwarding.toStationNm}`}
                        </StationName>
                    </>}
                    {stationVisit &&
                        <StaitonVisMsg>
                            {stationVisit.stationVisMsg}
                        </StaitonVisMsg>
                    }
                </WaitingDesInfo>
            </WaitingDesInfoContainer>
            <FocusBlank ref={focusBlank} tabIndex={0} />
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

const PageGuideImage = styled.div`
    position: fixed;
    opacity: 0.95;
    top:7.5%;
    height: 92.5%;
    width: 100%;
    z-index: 500;
    background-color: #D9D9D9;
`;

const WaitingDesInfoContainer = styled.div`
    height: 92.5%;
    width: 85%;
    border: 0.7vw solid var(--main-border-color);
    border-radius: 4vw;
    color: var(--main-font-color);
`;

const PageGuideButton = styled.div`
    height: calc(7.5vw - 4vw);
    width: calc(100% - 4vw);
    padding: 2vw 3vw 2vw 1vw;
    text-align: right;
    font-size: 3.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const WaitingDesInfo = styled.div`
  height: calc(100% - 7vw);
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const ReservationType = styled.h2` 
    text-align: center;
    margin-bottom: 3vw;
    font-size: 6vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const StationName = styled.h1` 
    text-align: center;
    margin-bottom: 8vw;
    font-size: 7.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const StaitonVisMsg = styled.h3`
    margin-bottom: 5%;
    text-align: center;
    font-size: 5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;