"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import 'swiper/css';
import styled from "styled-components";
import { PathFinderStep } from "./PathFinder";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { IForwarding } from "@/models/IForwarding";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import Image from "next/image";


interface ReservationDesConfirmProps {
    setStep: React.Dispatch<React.SetStateAction<PathFinderStep>>;
    forwarding: IForwarding | null;
}


export default function ReservationDesConfirm({ setStep, forwarding }: ReservationDesConfirmProps) {
    // ref
    const ReservationInfoContainerRef = useRef<HTMLDivElement>(null);
    const focusBlank = useRef<HTMLDivElement>(null);


    // state
    const [displayPageGuide, setDisplayPageGuide] = useState<boolean>(false);


    // handler
    const handleGoBack = useCallback(() => {
        SpeechOutputProvider.speak(" ").then(() => {
            setStep("reservationBusConfirm");
        });
    }, [setStep]);


    const handleGoNext = useCallback(() => {
        SpeechOutputProvider.speak(" ").then(() => {
            setStep("waitingDestination");
        });
    }, [setStep]);

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


    const handleSpeak = useCallback((forwarding: IForwarding) => {
        const text = `
            ${forwarding.busRouteNm} 버스를 탑승하셨으면,
            왼쪽으로 스와이프하여
            ${forwarding.toStationNm} 정류장 하차 예약을 하세요.
        `;
        return SpeechOutputProvider.speak(text);
    }, []);


    const handleTouch = useCallback(() => {
        if (forwarding) {
            handleSpeak(forwarding);
        }
    }, [forwarding, handleSpeak]);


    // effect
    useEffect(() => {
        VibrationProvider.vibrate(500);
    }, []);


    useEffect(() => {
        handleTouch();
    }, [handleTouch])


    // render
    return (
        <Wrapper {...handleHorizontalSwipe}>
            {displayPageGuide &&
                <PageGuideImage onClick={handlePageGuideClose}>
                    <Image src="/images/blindroute_page_guide_reservation_des_confirm.png" alt="page_guide" fill priority />
                </PageGuideImage>
            }
            <ReservationInfoContainer ref={ReservationInfoContainerRef}>
                <PageGuideButton onClick={handlePageGuideOpen}>
                    {'ⓘ 사용 가이드 (보호자 전용)'}
                </PageGuideButton>
                <ReservationInfo onClick={handleTouch}>
                    {forwarding && <>
                        <StationInfo>
                            {`하차: ${forwarding.toStationNm}`}
                        </StationInfo>
                        <BusInfo>
                            {`${forwarding.busRouteNm}, ${forwarding.busRouteDir} 방면`}
                        </BusInfo>
                    </>}
                </ReservationInfo>
            </ReservationInfoContainer>
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

const ReservationInfoContainer = styled.div`
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

const ReservationInfo = styled.div`
    height: calc(100% - 7vw);
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const StationInfo = styled.h1` 
    text-align: center;
    margin-bottom: 8vw;
    font-size: 7.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const BusInfo = styled.h3`
    margin-bottom: 5%;
    text-align: center;
    font-size: 5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;