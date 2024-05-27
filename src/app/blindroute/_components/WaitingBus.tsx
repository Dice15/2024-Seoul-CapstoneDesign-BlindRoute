"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import 'swiper/css';
import styled from "styled-components";
import { PathFinderStep } from "./PathFinder";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { IForwarding } from "@/core/type/IForwarding";
import { IBusArrival } from "@/core/type/IBusArrival";
import { getBusArrival } from "../_functions/getBusArrival";
import LoadingAnimation from "@/app/_components/LoadingAnimation";


interface WaitingBusProps {
    setStep: React.Dispatch<React.SetStateAction<PathFinderStep>>;
    forwarding: IForwarding | null;
    setOnBoardVehId: React.Dispatch<React.SetStateAction<string | null>>
}


export default function WaitingBus({ setStep, forwarding, setOnBoardVehId }: WaitingBusProps) {
    // ref
    const WaitingBusInfoContainerRef = useRef<HTMLDivElement>(null);
    const focusBlank = useRef<HTMLDivElement>(null);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);


    // state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [busArrival, setBusArrival] = useState<IBusArrival | null>(null);


    // handler
    const handleGoBack = useCallback(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
        }

        SpeechOutputProvider.speak("버스 예약을 취소하였습니다.").then(() => {
            setStep("reservationConfirm");
        });

    }, [setStep]);


    const handleGoNext = useCallback(() => {
        setStep("quitConfirm");
    }, [setStep]);


    const busArrival1ToMsg = useCallback((busArrival: IBusArrival) => {
        const arrivalTime = busArrival.busArrMsg1.match(/\d+분\d+초후|곧 도착|운행종료/);// || ["도착 정보가 없습니다."])[0];
        if (!arrivalTime) return "버스 도착 정보가 없습니다.";
        if (arrivalTime[0] === "곧 도착") return "버스가 곧 도착 합니다.";
        if (arrivalTime[0] === "곧 운행종료") return "버스 운행이 종료되었습니다.";
        return `${arrivalTime[0]}에 도착합니다`;
    }, []);


    const busArrival2ToMsg = useCallback((busArrival: IBusArrival) => {
        const arrivalTime = busArrival.busArrMsg2.match(/\d+분\d+초후/);// || ["도착 정보가 없습니다."])[0];
        if (!arrivalTime) return "다음 버스는 도착 정보가 없습니다.";
        return `다음 버스는 ${arrivalTime[0]}에 도착합니다.`;
    }, []);


    const handleHorizontalSwipe = useSwipeable({
        onSwipedRight: useCallback(() => {
            handleGoBack()
        }, [handleGoBack]),
        trackMouse: true
    });


    const handleTouch = useCallback(() => {
        if (forwarding && busArrival) {
            SpeechOutputProvider.speak(`${forwarding.busRouteNm} 버스를 대기중입니다.`)
                .then(async () => { await SpeechOutputProvider.speak(busArrival1ToMsg(busArrival)) })
                .then(async () => { await SpeechOutputProvider.speak(busArrival2ToMsg(busArrival)) });
        }
    }, [forwarding, busArrival, busArrival1ToMsg, busArrival2ToMsg]);


    const handleCheckBusArrival = useCallback(async () => {
        if (!forwarding) return;
        getBusArrival(forwarding).then((newbusArrival) => {
            if (busArrival && newbusArrival.data.busArrival.busVehId1 !== busArrival.busVehId1) {
                setOnBoardVehId(busArrival.busVehId1);
                handleGoNext();
            }
            else {
                setBusArrival(newbusArrival.data.busArrival);
            }
        });
    }, [forwarding, setOnBoardVehId, busArrival, handleGoNext]);


    // effect
    useEffect(() => {
        if (isLoading && forwarding && busArrival) {
            setIsLoading(false);
            SpeechOutputProvider.speak(`${forwarding.busRouteNm} 버스를 대기중입니다.`)
                .then(async () => { await SpeechOutputProvider.speak(busArrival1ToMsg(busArrival)) })
                .then(async () => { await SpeechOutputProvider.speak(busArrival2ToMsg(busArrival)) });
        }
    }, [forwarding, isLoading, busArrival, busArrival1ToMsg, busArrival2ToMsg])


    useEffect(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }

        if (isLoading) {
            handleCheckBusArrival();
        }
        intervalIdRef.current = setInterval(handleCheckBusArrival, 15000);

        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        }
    }, [isLoading, handleCheckBusArrival])


    // render
    return (
        <Wrapper {...handleHorizontalSwipe}>
            <LoadingAnimation active={isLoading} />
            <WaitingBusInfoContainer ref={WaitingBusInfoContainerRef}>
                <WaitingBusInfo onClick={handleTouch}>
                    {forwarding &&
                        <BusName>
                            {forwarding.busRouteNm}
                        </BusName>
                    }
                    {busArrival &&
                        <BusArrMsg>
                            {busArrival.busArrMsg1}
                        </BusArrMsg>
                    }
                </WaitingBusInfo>
            </WaitingBusInfoContainer>
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

const WaitingBusInfoContainer = styled.div`
    height: 90%;
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
`;

const WaitingBusInfo = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const BusName = styled.h1` 
    text-align: center;
    margin-bottom: 8vw;
    font-size: 6.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const BusArrMsg = styled.h3`
    margin-bottom: 5%;
    text-align: center;
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;