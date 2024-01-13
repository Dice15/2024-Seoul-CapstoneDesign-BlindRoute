"use client"


import { ReserveBusStep } from "./ReserveBus";
import { useRef, useState } from "react";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import 'swiper/css';
import styled from "styled-components";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { Bus } from "@/core/type/Bus";
import { Station } from "@/core/type/Station";
import { reserveBus } from "@/core/api/blindrouteApi";
import { useSwipeable } from "react-swipeable";



interface SelectBusProps {
    setReserveStep: React.Dispatch<React.SetStateAction<{ prev: ReserveBusStep; curr: ReserveBusStep; }>>;
    selectedStation: Station;
    buses: Bus[];
    setReservedBus: React.Dispatch<React.SetStateAction<{ station: Station; bus: Bus, reservationId: string } | null>>;
}



export default function SelectBus({ setReserveStep, selectedStation, buses, setReservedBus }: SelectBusProps) {
    /* Ref */
    const busInfoContainer = useRef<HTMLDivElement>(null);
    const busListIndexRef = useRef<number>(0);
    const isSlidingRef = useRef(false);


    /* State */
    const [isLoading, setIsLoading] = useState(false);


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "currBus" | "failedReservation" | "noVehicleFound") => {
        //return;
        switch (type) {
            case "currBus": {
                const bus = buses[busListIndexRef.current];
                SpeechOutputProvider.speak(`"${bus.busRouteAbrv || bus.busRouteNm}번", ${bus.adirection} 방면`);
                break;
            }
            case "failedReservation": {
                SpeechOutputProvider.speak(`버스를 예약하는데 실패했습니다`);
                break;
            }
            case "noVehicleFound": {
                SpeechOutputProvider.speak("지금은 운행하는 버스가 없습니다.")
                break;
            }
        }
    }


    /** 이전 단계로 이동 */
    const handleBackToPrev = () => {
        setIsLoading(false);
        setReserveStep({
            prev: "selectBus",
            curr: "selectStation"
        });
    }


    /** 버스 예약 */
    const handleReserveBus = () => {
        reserveBus(selectedStation.stId, selectedStation.arsId, buses[busListIndexRef.current].busRouteId, "boarding").then(({ msg, reservationId }) => {
            setIsLoading(false);
            if (msg === "정상적으로 처리되었습니다." && reservationId !== null) {
                setReservedBus({ station: selectedStation, bus: buses[busListIndexRef.current], reservationId });
                setReserveStep({
                    prev: "selectBus",
                    curr: "waitingBus"
                });
            } else if (msg === "운행 종료되었습니다.") {
                handleAnnouncement("noVehicleFound");
            } else {
                handleAnnouncement("failedReservation");
            }
        });
    }


    /** 스와이프로 아이템이 변경되었을 때 발생하는 이벤트 */
    const handleSlideChange = (swiper: SwiperClass) => {
        VibrationProvider.vibrate(200);
        isSlidingRef.current = true; // 슬라이드 중으로 상태 변경
        busListIndexRef.current = swiper.realIndex;

        handleAnnouncement("currBus");
        setTimeout(() => isSlidingRef.current = false, 250); // 300ms는 애니메이션 시간에 맞게 조정
    };


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: () => {
            setIsLoading(true);
            setTimeout(() => { handleReserveBus(); }, 500);
        },
        onSwipedRight: () => {
            setIsLoading(true);
            handleBackToPrev();
        },
        trackMouse: true
    });


    /** vertical 스와이프 아이템 터치 이벤트 */
    const handleBusInfoClick = () => {
        VibrationProvider.vibrate(1000);
        handleAnnouncement("currBus");
    };


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <BusInfoContainer ref={busInfoContainer}>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={50}
                    onSlideChange={handleSlideChange}
                    speed={300}
                    loop={true}
                    direction="vertical"
                    style={{ height: "100%", width: "100%" }}
                >
                    {buses.map((bus, index) => (
                        <SwiperSlide key={index} style={{ height: "100%", width: "100%" }}>
                            <BusInfo onClick={handleBusInfoClick}>
                                <BusName>{bus.busRouteAbrv || bus.busRouteNm}</BusName>
                                <BusAdirection>{`${bus.adirection} 방면`}</BusAdirection>
                            </BusInfo>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </BusInfoContainer>
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


const BusInfoContainer = styled.div`
    height: 90%;
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
`;


const BusInfo = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;


const BusName = styled.h1` 
    text-align: center;
    margin-bottom: 4vw;
    font-size: 6.5vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const BusAdirection = styled.h3`
    text-align: center;
    font-size: 4vw;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;