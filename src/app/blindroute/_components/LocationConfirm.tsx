"use client"

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import 'swiper/css';
import styled from "styled-components";
import { PathFinderStep } from "./PathFinder";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";


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


    // handler
    const handleGoBack = useCallback(() => {
        router.replace('/chatbot');
    }, [router]);


    const handleLocationConfirm = useCallback(() => {
        setStep("selectStart");
    }, [setStep]);


    const handleHorizontalSwipe = useSwipeable({
        onSwipedLeft: useCallback(() => {
            handleLocationConfirm();
        }, [handleLocationConfirm]),
        onSwipedRight: useCallback(() => {
            handleGoBack()
        }, [handleGoBack]),
        trackMouse: true
    });


    // effect
    useEffect(() => {
        if (locations) {
            SpeechOutputProvider.speak(`출발지 ${locations?.start || ""}, 도착지 ${locations?.destination || ""}이 맞다면 왼쪽으로 스와이프, 아니라면 오른쪽으로 스와이프를 하세요.`);
        }
    }, [locations]);


    // render
    return (
        <Wrapper {...handleHorizontalSwipe}>
            <LocationInfoContainer ref={LocationInfoContainerRef}>
                <LocationInfo>
                    {locations && <>
                        <LocationName>
                            {`출발지: ${locations?.start || ""}`}
                        </LocationName>
                        <LocationName>
                            {`도착지: ${locations?.destination || ""}`}
                        </LocationName>
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

const LocationInfoContainer = styled.div`
    height: 90%;
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
`;

const LocationInfo = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const LocationName = styled.h3`
    margin-bottom: 5%;
    text-align: center;
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;