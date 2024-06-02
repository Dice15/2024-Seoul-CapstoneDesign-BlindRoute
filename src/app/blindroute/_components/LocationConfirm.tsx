"use client"

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import 'swiper/css';
import styled from "styled-components";
import { PathFinderStep } from "./PathFinder";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import Image from "next/image";


interface LocationConfirmProps {
    locations: {
        start: string;
        destination: string;
    } | null;
    setStep: React.Dispatch<React.SetStateAction<PathFinderStep>>;
}


export default function LocationConfirm({ locations, setStep }: LocationConfirmProps) {
    // hook
    const router = useRouter();


    // ref
    const LocationInfoContainerRef = useRef<HTMLDivElement>(null);
    const focusBlank = useRef<HTMLDivElement>(null);


    // state
    const [displayPageGuide, setDisplayPageGuide] = useState<boolean>(false);


    // handler
    const handleGoBack = useCallback(() => {
        SpeechOutputProvider.speak(" ").then(() => {
            router.replace('/chatbot');
        });
    }, [router]);


    const handleGoNext = useCallback(() => {
        SpeechOutputProvider.speak(" ").then(() => {
            setStep("selectStart");
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


    const handleTouch = useCallback(() => {
        if (locations) {
            SpeechOutputProvider.speak(`출발지 ${locations?.start || ""}, 도착지 ${locations?.destination || ""}로 경로 탐색을 시작하려면 왼쪽으로 스와이프 하세요.`);
        }
    }, [locations]);


    // effect
    useEffect(() => {
        VibrationProvider.vibrate(500);
    }, []);


    useEffect(() => {
        handleTouch();
    }, [handleTouch]);


    // render
    return (
        <Wrapper {...handleHorizontalSwipe}>
            {displayPageGuide &&
                <PageGuideImage onClick={handlePageGuideClose}>
                    <Image src="/images/blindroute_page_guide_location_confirm.png" alt="page_guide" fill priority />
                </PageGuideImage>
            }
            <LocationInfoContainer ref={LocationInfoContainerRef}>
                <PageGuideButton onClick={handlePageGuideOpen}>
                    {'ⓘ 사용 가이드 (보호자 전용)'}
                </PageGuideButton>
                <LocationInfo onClick={handleTouch}>
                    {locations && <>
                        <LocationTitle>{'출발지'}</LocationTitle>
                        <LocationName>{`${locations?.start || ""}`}</LocationName>
                        <LocationTitle>{'도착지'}</LocationTitle>
                        <LocationName>{`${locations?.destination || ""}`}</LocationName>
                    </>}
                </LocationInfo>
            </LocationInfoContainer>
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

const LocationInfoContainer = styled.div`
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

const LocationInfo = styled.div`
    height: calc(100% - 7vw);
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const LocationTitle = styled.h1`
    margin-bottom: 3vw;
    text-align: center;
    font-size: 7.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const LocationName = styled.h3`
    margin-bottom: 14vw;
    text-align: center;
    font-size: 5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;