"use client"

import { Station } from "@/core/type/Station";
import { ReserveBusStep } from "./ReserveBus";
import { useEffect, useState } from "react";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import styled from "styled-components";
import { cancelReservation, getBusPosByVehId } from "@/core/api/blindrouteApi";
import { useSwipeable } from "react-swipeable";
import useTouchEvents from "@/core/hooks/useTouchEvents";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import LoadingAnimation from "@/app/_components/LoadingAnimation";


interface WaitingDestinationProps {
    setReserveStep: React.Dispatch<React.SetStateAction<{ prev: ReserveBusStep; curr: ReserveBusStep; }>>;
    boardingVehId: string;
    destinations: Station[];
    selectedDestination: Station;
}


export default function WaitingDestination({ setReserveStep, boardingVehId, destinations, selectedDestination }: WaitingDestinationProps) {
    // States
    const [waitingMsg, setWaitingMsg] = useState("대기중");
    const [isLoading, setIsLoading] = useState(false);
    const [desPosIdx, setDesPosIdx] = useState(-1);
    const [curPosIdx, setCurPosIdx] = useState(-1);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "arrivalInfo") => {
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
    }


    /** 버스 예약 취소 */
    const handleCancelReservation = () => {
        cancelReservation().then(({ msg, deletedCount }) => {
            setIsLoading(false);
            setReserveStep({
                prev: "waitingDestination",
                curr: "selectDestination"
            });
        });
    }


    /** 목적지에 도착하면 예약을 삭제함 */
    const handleArrivedDestination = () => {
        cancelReservation().then(({ msg, deletedCount }) => {
            setIsLoading(false);
            setReserveStep({
                prev: "waitingDestination",
                curr: "arrivalDestination"
            });
        });
    }


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedRight: () => {
            setIsLoading(true);
            handleCancelReservation();
        },
        trackMouse: true
    });


    /** 화면 터치 이벤트 */
    const handleBusInfoClick = () => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("arrivalInfo");
    };


    // Effects
    /** 대기중 메시지 이벤트 */
    useEffect(() => {
        setTimeout(() => { handleAnnouncement("arrivalInfo"); }, 400);
    }, [selectedDestination]);


    /** 목적지 정류장의 seq 저장 */
    useEffect(() => {
        setDesPosIdx(destinations.findIndex((station) => station.seq === selectedDestination.seq));
    }, [setDesPosIdx, destinations, selectedDestination]);


    useEffect(() => {
        const intervalId = setInterval(() => {
            setWaitingMsg(prevMessage => {
                if (prevMessage === "대기중") return "대기중.";
                if (prevMessage === "대기중.") return "대기중..";
                if (prevMessage === "대기중..") return "대기중...";
                return "대기중";
            });
        }, 1000);

        return () => {
            clearInterval(intervalId);
        }
    }, [setWaitingMsg]);


    /** 예약한 버스가 도착했는지 2초마다 확인함 */
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const newBusPos = (await getBusPosByVehId(boardingVehId)).currStation;
            if (newBusPos !== null) {
                const newPosIdx = destinations.findIndex((station) => station.seq === newBusPos.seq);

                // 버스의 다음 정류장이 복적지의 다음 정류장이면 도착했다고 간주
                if (newPosIdx === desPosIdx) {
                    SpeechOutputProvider.speak("버스가 도착했습니다");
                    setIsLoading(true);
                    handleArrivedDestination();
                } else {
                    setCurPosIdx(newPosIdx);
                }
            }
        }, 2000);

        return () => {
            clearInterval(intervalId);
        }
    }, [boardingVehId, destinations, desPosIdx, setIsLoading, setCurPosIdx]);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <ReservationContainer
                onClick={handleBusInfoClick}
            >
                <ReservationDestinationName>{selectedDestination.stNm}</ReservationDestinationName>
                <WiatingMessage>{waitingMsg}</WiatingMessage>
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
