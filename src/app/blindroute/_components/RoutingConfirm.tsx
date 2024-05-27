"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import 'swiper/css';
import styled from "styled-components";
import { PathFinderStep } from "./PathFinder";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { Station } from "@/core/type/Station";
import { IRouting } from "@/core/type/IRouting";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { getRoute } from "../_functions/getRouteByLocation";


interface RoutingConfirmProps {
    setStep: React.Dispatch<React.SetStateAction<PathFinderStep>>;
    start: Station | null;
    destination: Station | null;
    routing: IRouting | null;
    setRouting: React.Dispatch<React.SetStateAction<IRouting | null>>;
}


export default function RoutingConfirm({ setStep, start, destination, routing, setRouting }: RoutingConfirmProps) {
    // ref
    const LocationInfoContainerRef = useRef<HTMLDivElement>(null);
    const focusBlank = useRef<HTMLDivElement>(null);


    // state
    const [isLoading, setIsLoading] = useState<boolean>(true);


    // handler
    const handleGoBack = useCallback(() => {
        setStep("selectStart");
    }, [setStep]);


    const handleLocationConfirm = useCallback(() => {
        setStep("reservationConfirm");
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


    const handleTouch = useCallback(() => {
        if (routing) {
            SpeechOutputProvider.speak(`${routing.forwarding.length}개의 버스를 탑승합니다.`)
                .then(async () => { await SpeechOutputProvider.speak(`비용은 ${routing.fare}원, 시간은 ${Math.round(parseFloat(routing.time) / 60)}분 소요됩니다.`) })
                .then(async () => { await SpeechOutputProvider.speak(`왼쪽으로 스와이프하면 경로 안내를 시작합니다.`) });
        }
    }, [routing]);


    // effect
    useEffect(() => {
        setRouting(null);
        // if (start && destination) {
        getRoute().then((response) => {
            if (response.data.forwarding.length > 0) {
                SpeechOutputProvider.speak(`${response.data.forwarding.length}개의 버스를 탑승합니다.`)
                    .then(async () => { await SpeechOutputProvider.speak(`비용은 ${response.data.fare}원, 시간은 ${Math.round(parseFloat(response.data.time) / 60)}분 소요됩니다.`) })
                    .then(async () => { await SpeechOutputProvider.speak(`왼쪽으로 스와이프하면 경로 안내를 시작합니다.`) });
                setRouting(response.data);
                setIsLoading(false);
                console.log(response.data.forwarding)
            }
            else {
                SpeechOutputProvider.speak(`검색된 경로가 없습니다`);
                handleGoBack();
            }
            // }
        })
    }, [start, destination, setRouting, handleGoBack])


    // render
    return (
        <Wrapper {...handleHorizontalSwipe}>
            <LoadingAnimation active={isLoading} />
            <RoutingInfoContainer ref={LocationInfoContainerRef}>
                <RoutingInfo onClick={handleTouch}>
                    {routing && <>
                        <ForwardingInfo>
                            {`${routing.forwarding.length}개의 버스 탑승`}
                        </ForwardingInfo>
                        <CostInfo>
                            {`${routing.fare}원, ${Math.round(parseFloat(routing.time) / 60)}분`}
                        </CostInfo>
                    </>}
                </RoutingInfo>
            </RoutingInfoContainer>
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

const RoutingInfoContainer = styled.div`
    height: 90%;
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
`;

const RoutingInfo = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const ForwardingInfo = styled.h1` 
    text-align: center;
    margin-bottom: 8vw;
    font-size: 6.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const CostInfo = styled.h3`
    margin-bottom: 5%;
    text-align: center;
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;