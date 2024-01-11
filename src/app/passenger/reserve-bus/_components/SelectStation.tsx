"use client"

import { Station } from "@/core/type/Station";
import { ReserveBusStep } from "./ReserveBus";
import { useEffect, useRef, useState } from "react";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import 'swiper/css';
import styled from "styled-components";
import useElementDimensions from "@/core/hooks/useElementDimensions";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import useTouchEvents from "@/core/hooks/useTouchEvents";
import { getBuses } from "@/core/api/blindrouteApi";
import { Bus } from "@/core/type/Bus";



export interface SelectStationProps {
    setCurrStep: React.Dispatch<React.SetStateAction<ReserveBusStep>>;
    stations: Station[];
    setSelectedStation: React.Dispatch<React.SetStateAction<Station | null>>
    setBuses: React.Dispatch<React.SetStateAction<Bus[]>>;
}



export default function SelectStation({ setCurrStep, stations, setSelectedStation, setBuses }: SelectStationProps) {
    /* Ref */
    const stationInfoContainer = useRef<HTMLDivElement>(null);
    const stationListIndexRef = useRef<number>(0);
    const isSlidingRef = useRef(false);


    /* State */
    const [isLoading, setIsLoading] = useState(false);


    /* Custom Hook */
    const stationInfoContainerHeight = useElementDimensions<HTMLDivElement>(stationInfoContainer, "Pure").height;


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "guide" | "currStation" | "noBusesFound") => {
        //return;
        switch (type) {
            case "guide": {
                const station = stations[stationListIndexRef.current];
                SpeechOutputProvider.speak(`정류장을 선택하세요, "${station.stNm}", 화면을 두번 터치하면 정류장의 버스를 검색합니다.`);
                break;
            }
            case "currStation": {
                const station = stations[stationListIndexRef.current];
                SpeechOutputProvider.speak(`"${station.stNm}", 화면을 두번 터치하면 정류장의 버스를 검색합니다.`);
                break;
            }
            case "noBusesFound": {
                SpeechOutputProvider.speak(`검색된 버스가 없습니다`);
                break;
            }
        }
    }


    const handleGetBuses = () => {
        getBuses(stations[stationListIndexRef.current].arsId).then(({ msg, itemList }) => {
            setIsLoading(false);
            if (msg === "정상적으로 처리되었습니다." && itemList.length > 0) {
                setSelectedStation(stations[stationListIndexRef.current])
                setBuses(itemList);
                setCurrStep("selectBus");
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


    /** 스와이프 아이템 터치 이벤트 */
    const handleStationInfoClick = useTouchEvents({
        onSingleTouch: () => {
            VibrationProvider.vibrate(1000);
            handleAnnouncement("currStation");
        },
        onDoubleTouch: () => {
            VibrationProvider.repeatVibrate(500, 200, 2);
            setIsLoading(true);
            setTimeout(() => { handleGetBuses(); }, 500);

        }
    });


    // Effects
    useEffect(() => {
        setTimeout(() => { handleAnnouncement("guide"); }, 500);
    }, [setCurrStep, stations, setSelectedStation, setBuses]);


    // Render
    return (
        <Wrapper>
            <LoadingAnimation active={isLoading} />
            <StationInfoContainer ref={stationInfoContainer}>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={50}
                    onSlideChange={handleSlideChange}
                    speed={300}
                    loop={true}
                >
                    {stations.map((station, index) => (
                        <SwiperSlide key={index}>
                            <StationInfo
                                style={{ height: `${stationInfoContainerHeight}px` }}
                                onClick={handleStationInfoClick}
                            >
                                <StationInfoName>{station.stNm}</StationInfoName>
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


const StationInfoContainer = styled.div`
    height: 90%;
    width: 90%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
`;


const StationInfo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const StationInfoName = styled.h1` 
    font-size: 7vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;