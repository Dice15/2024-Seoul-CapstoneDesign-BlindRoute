"use client"

import { Station } from "@/core/type/Station";
import { ReserveBusStep } from "./ReserveBus";
import { useEffect, useRef, useState } from "react";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import 'swiper/css';
import styled from "styled-components";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { getBuses } from "@/core/api/blindrouteApi";
import { Bus } from "@/core/type/Bus";
import { useSwipeable } from "react-swipeable";



interface SelectStationProps {
    setReserveStep: React.Dispatch<React.SetStateAction<{ prev: ReserveBusStep; curr: ReserveBusStep; }>>;
    stations: Station[];
    setSelectedStation: React.Dispatch<React.SetStateAction<Station | null>>
    setBuses: React.Dispatch<React.SetStateAction<Bus[]>>;
}



export default function SelectStation({ setReserveStep, stations, setSelectedStation, setBuses }: SelectStationProps) {
    /* Ref */
    const stationInfoContainer = useRef<HTMLDivElement>(null);
    const stationListIndexRef = useRef<number>(0);
    const isSlidingRef = useRef(false);
    const focusBlankRef = useRef<HTMLDivElement>(null);


    /* State */
    const [isLoading, setIsLoading] = useState(false);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "currStation" | "noBusesFound") => {
        switch (type) {
            case "currStation": {
                const station = stations[stationListIndexRef.current];
                SpeechOutputProvider.speak(`"${station.stNm}", ${station.stDir} 방면`);
                break;
            }
            case "noBusesFound": {
                SpeechOutputProvider.speak(`검색된 버스가 없습니다`);
                break;
            }
        }
    }


    /** 이전 단계로 이동 */
    const handleBackToPrev = () => {
        setIsLoading(false);
        setReserveStep({
            prev: "selectStation",
            curr: "searchStation"
        });
    }


    /** 선택한 정류장를 경유하는 버스노선을 가져옴 */
    const handleGetBuses = () => {
        getBuses(stations[stationListIndexRef.current].arsId).then(({ msg, itemList }) => {
            setIsLoading(false);
            if (msg === "정상적으로 처리되었습니다." && itemList.length > 0) {
                setSelectedStation(stations[stationListIndexRef.current])
                setBuses(itemList);
                setReserveStep({
                    prev: "selectStation",
                    curr: "selectBus"
                });
            } else {
                handleAnnouncement("noBusesFound");
            }
        });
    }


    /** 스와이프로 아이템이 변경되었을 때 발생하는 이벤트 */
    const handleSlideChange = (swiper: SwiperClass) => {
        VibrationProvider.vibrate(200);
        isSlidingRef.current = true; // 슬라이드 중으로 상태 변경
        stationListIndexRef.current = swiper.realIndex;

        handleAnnouncement("currStation");
        setTimeout(() => isSlidingRef.current = false, 250); // 300ms는 애니메이션 시간에 맞게 조정
    };


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: () => {
            setIsLoading(true);
            setTimeout(() => { handleGetBuses(); }, 500);
        },
        onSwipedRight: () => {
            setIsLoading(true);
            handleBackToPrev();
        },
        trackMouse: true
    });


    /** vertical 스와이프 아이템 터치 이벤트 */
    const handleStationInfoClick = () => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("currStation");
    };


    // Effect
    useEffect(() => {
        if (focusBlankRef.current) {
            focusBlankRef.current.focus();
        }
    }, []);


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <FocusBlank ref={focusBlankRef} tabIndex={0} />
            <LoadingAnimation active={isLoading} />
            <StationInfoContainer ref={stationInfoContainer}>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={50}
                    onSlideChange={handleSlideChange}
                    speed={300}
                    loop={true}
                    direction="vertical"
                    style={{ height: "100%", width: "100%" }}
                >
                    {stations.map((station, index) => (
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


const FocusBlank = styled.div`
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
    margin-bottom: 8vw;
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