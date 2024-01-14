"use client"

import { Station } from "@/core/type/Station";
import { ReserveBusStep } from "./ReserveBus";
import { useCallback, useEffect, useRef, useState } from "react";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import styled from "styled-components";
import { cancelReservation, getBusPosByVehId } from "@/core/api/blindrouteApi";
import { useSwipeable } from "react-swipeable";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { Boarding } from "@/core/type/Boarding";


interface WaitingDestinationProps {
    setStep: React.Dispatch<React.SetStateAction<ReserveBusStep>>;
    boarding: Boarding;
    destinations: Station[];
    selectedDestination: Station;
}


export default function WaitingDestination({ setStep, boarding, destinations, selectedDestination }: WaitingDestinationProps) {
    // States
    const [isFirstRender, setIsFirstRender] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [desPosIdx, setDesPosIdx] = useState(-1);
    const [curPosIdx, setCurPosIdx] = useState(-1);


    // Ref
    const focusBlankRef = useRef<HTMLDivElement>(null);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = useCallback((type: "arrivalInfo") => {
        //return;
        switch (type) {
            case "arrivalInfo": {
                const idxGap = desPosIdx - curPosIdx;
                const arrMsg = (desPosIdx < 0 || curPosIdx < 0) ? ""
                    : idxGap < 0 ? "정류장에 도착했습니다."
                        : idxGap === 0 ? "정류장에 도착합니다!"
                            : `${idxGap}개의 정거장이 남았습니다`;
                SpeechOutputProvider.speak(`"${selectedDestination.stNm}", "${selectedDestination.stDir} 방면" 정류장에 하차 대기중입니다. ${arrMsg}`);
                break;
            }
        }
    }, [curPosIdx, desPosIdx, selectedDestination.stDir, selectedDestination.stNm]);


    /** 버스 예약 취소 */
    const handleCancelReservation = useCallback(() => {
        cancelReservation().then(({ msg, deletedCount }) => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }

            setTimeout(() => {
                SpeechOutputProvider.speak("목적지 예약을 취소하였습니다.").then(() => {
                    setIsLoading(false);
                    setStep("selectDestination");
                });
            }, 200);
        });
    }, [setStep]);


    /** 목적지에 도착하면 예약을 삭제함 */
    const handleArrivedDestination = useCallback(() => {
        cancelReservation().then(({ msg, deletedCount }) => {
            setIsLoading(false);
            setStep("arrivalDestination");
        });
    }, [setStep]);


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedRight: useCallback(() => {
            setIsLoading(true);
            handleCancelReservation();
        }, [handleCancelReservation]),
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = useCallback(() => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("arrivalInfo");
    }, [handleAnnouncement]);


    /** 탑승한 차량의 위치를 추적하여 목적지에 도착했는지 확인 */
    const handleCheckDestinationArrival = useCallback(async () => {
        const newBusPos = (await getBusPosByVehId(boarding.vehId)).currStation;
        if (newBusPos !== null) {
            const newPosIdx = destinations.findIndex((station) => station.seq === newBusPos.seq);

            if (newPosIdx === desPosIdx) {
                setIsLoading(true);
                handleArrivedDestination();
            } else {
                setCurPosIdx(newPosIdx);
            }
        }
    }, [boarding.vehId, desPosIdx, destinations, handleArrivedDestination]);


    // Effects
    useEffect(() => {
        if (focusBlankRef.current) {
            focusBlankRef.current.focus();
        }
    }, []);


    /** 첫번쨰 랜더링일 때는 바로 버스 도착정보를 체크함 */
    useEffect(() => {
        if (isFirstRender) {
            handleCheckDestinationArrival();
            setIsFirstRender(false);
        }
    }, [isFirstRender, setIsFirstRender, handleCheckDestinationArrival]);


    /** 예약한 버스가 도착했는지 12초마다 확인함 */
    useEffect(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        intervalIdRef.current = setInterval(handleCheckDestinationArrival, 12000);

        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, [handleCheckDestinationArrival]);


    /** 목적지 정류장의 seq 저장 */
    useEffect(() => {
        setDesPosIdx(destinations.findIndex((station) => station.seq === selectedDestination.seq));
    }, [destinations, selectedDestination.seq]);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
                tabIndex={1}
            >
                <ReservationDestinationName>{selectedDestination.stNm}</ReservationDestinationName>
                <WiatingMessage>{"목적지로 이동중"}</WiatingMessage>
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


const ReservationDestinationName = styled.h1`
    text-align: center;
    margin-bottom: 4vw;
    font-size: 6.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const WiatingMessage = styled.h3`
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;
