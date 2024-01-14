"use client"

import { Station } from "@/core/type/Station";
import { ReserveBusStep } from "./ReserveBus";
import { useCallback, useEffect, useRef, useState } from "react";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { useSwipeable } from "react-swipeable";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import styled from "styled-components";
import { reserveBus } from "@/core/api/blindrouteApi";
import { Boarding } from "@/core/type/Boarding";


interface SelectDestinationProps {
    setStep: React.Dispatch<React.SetStateAction<ReserveBusStep>>;
    boarding: Boarding;
    destinations: Station[];
    setSelectedDestination: React.Dispatch<React.SetStateAction<Station | null>>;
}


export default function SelectDestination({ setStep, boarding, destinations, setSelectedDestination }: SelectDestinationProps) {
    /* Ref */
    const stationInfoContainer = useRef<HTMLDivElement>(null);
    const stationListIndexRef = useRef<number>(0);
    const isSlidingRef = useRef(false);
    const focusBlankRef = useRef<HTMLDivElement>(null);


    /* State */
    const [isLoading, setIsLoading] = useState(false);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = useCallback((type: "currStation" | "failedReservation") => {
        //return;
        switch (type) {
            case "currStation": {
                const station = destinations[stationListIndexRef.current];
                SpeechOutputProvider.speak(`"${station.stNm}", ${station.stDir} 방면`);
                break;
            }
            case "failedReservation": {
                SpeechOutputProvider.speak(`하차를 예약하는데 실패했습니다`);
                break;
            }
        }
    }, [destinations]);


    /** 이전 단계로 이동 */
    const handleBackToPrev = useCallback(() => {
        setIsLoading(false);
        setStep("arrivalBus");
    }, [setStep]);


    const reserveDestination = useCallback(() => {
        const station = destinations[stationListIndexRef.current];
        reserveBus(station.stId, station.arsId, boarding.bus.busRouteId, "alighting").then(({ msg, reservationId }) => {
            setIsLoading(false);
            if (msg === "정상적으로 처리되었습니다." && reservationId !== null) {
                setSelectedDestination(station);
                setStep("waitingDestination");
            } else {
                handleAnnouncement("failedReservation");
            }
        });
    }, [boarding.bus.busRouteId, destinations, handleAnnouncement, setSelectedDestination, setStep]);


    /** 스와이프로 아이템이 변경되었을 때 발생하는 이벤트 */
    const handleSlideChange = useCallback((swiper: SwiperClass) => {
        VibrationProvider.vibrate(200);
        isSlidingRef.current = true; // 슬라이드 중으로 상태 변경
        stationListIndexRef.current = swiper.realIndex;

        handleAnnouncement("currStation");
        setTimeout(() => isSlidingRef.current = false, 250); // 300ms는 애니메이션 시간에 맞게 조정
    }, [handleAnnouncement]);


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: useCallback(() => {
            setIsLoading(true);
            setTimeout(() => { reserveDestination(); }, 500);
        }, [reserveDestination]),
        onSwipedRight: useCallback(() => {
            setIsLoading(true);
            handleBackToPrev();
        }, [handleBackToPrev]),
        trackMouse: true
    });



    /** vertical 스와이프 아이템 터치 이벤트 */
    const handleStationInfoClick = useCallback(() => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("currStation");
    }, [handleAnnouncement]);


    // Effect
    useEffect(() => {
        if (focusBlankRef.current) {
            focusBlankRef.current.focus();
        }
    }, []);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <StationInfoContainer ref={stationInfoContainer}>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={50}
                    onSlideChange={handleSlideChange}
                    speed={300}
                    direction="vertical"
                    style={{ height: "100%", width: "100%" }}
                >
                    {destinations.map((station, index) => (
                        <SwiperSlide key={index} style={{ height: "100%", width: "100%" }}>
                            <StationInfo
                                onClick={handleStationInfoClick}
                                tabIndex={1}
                            >
                                <StationName>{station.stNm}</StationName>
                                <StationDirection>{`${station.stDir} 방면`}</StationDirection>
                            </StationInfo>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </StationInfoContainer>
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


const StationInfoContainer = styled.div`
    height: 90%;
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
`;


const StationInfo = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;


const StationName = styled.h1` 
    text-align: center;
    margin-bottom: 4vw;
    font-size: 6.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;


const StationDirection = styled.h3`
    text-align: center;
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;