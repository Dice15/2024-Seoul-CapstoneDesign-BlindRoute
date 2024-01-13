"use client"

import { useEffect, useState } from "react";
import SearchStation from "./SearchStation";
import styled from "styled-components";
import { Station } from "@/core/type/Station";
import SelectStation from "./SelectStation";
import { Bus } from "@/core/type/Bus";
import SelectBus from "./SelectBus";
import WaitingBus from "./WaitingBus";
import ArrivalBus from "./ArrivalBus";
import SelectDestination from "./SelectDestination";
import WaitingDestination from "./WaitingDestination";
import ArrivalDestination from "./ArrivalDestination";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";



/** 예약 단계 */
export type ReserveBusStep = "searchStation" | "selectStation" | "selectBus" | "waitingBus" | "arrivalBus" | "selectDestination" | "waitingDestination" | "arrivalDestination";


/** 예약 단계에 따른 타이틀을 반환하는 함수 */
function stepToTitle(step: ReserveBusStep): string {
    switch (step) {
        case "searchStation":
            return "정류장 검색";
        case "selectStation":
            return "정류장 선택";
        case "selectBus":
            return "버스 선택";
        case "waitingBus":
            return "버스 대기";
        case "arrivalBus":
            return "버스 도착";
        case "selectDestination":
            return "목적지 선택";
        case "waitingDestination":
            return "목적지 대기";
        case "arrivalDestination":
            return "목적지 도착";
        default:
            return "알 수 없는 단계";
    }
}


/** 예약 단계에 따른 음성 안내 */
function stepAnnouncement(step: ReserveBusStep, isPageInit: boolean) {
    switch (step) {
        case "searchStation": {
            isPageInit && VibrationProvider.vibrate(1000);
            SpeechOutputProvider.speak("정류장 검색 페이지입니다. 텍스트 입력 또는 음성인식으로 검색할 수 있습니다.");
            break;
        }
        case "selectStation": {
            isPageInit && VibrationProvider.vibrate(1000);
            SpeechOutputProvider.speak(`정류장을 선택하세요. 위아래 스와이프로 정류장을 선택할 수 있습니다.`);
            break;
        }
        case "selectBus": {
            isPageInit && VibrationProvider.vibrate(1000);
            SpeechOutputProvider.speak(`버스를 선택하세요. 위아래 스와이프로 버스를 선택할 수 있습니다.`);
            break;
        }
        case "waitingBus": {
            isPageInit && VibrationProvider.vibrate(1000);
            SpeechOutputProvider.speak(`버스를 대기 중입니다. 화면을 터치하면 버스 도착까지 남은 시간을 알 수 있습니다.`);
            break;
        }
        case "arrivalBus": {
            isPageInit && VibrationProvider.vibrate(5000);
            SpeechOutputProvider.speak(`버스가 도착했습니다. ${isPageInit ? "10초 뒤" : "잠시 후"} 자동으로 목적지 선택 페이지로 이동합니다.`);
            break;
        }
        case "selectDestination": {
            isPageInit && VibrationProvider.vibrate(1000);
            SpeechOutputProvider.speak(`목적지를 선택하세요. 위아래 스와이프로 정류장을 선택할 수 있습니다.`);
            break;
        }
        case "waitingDestination": {
            isPageInit && VibrationProvider.vibrate(1000);
            SpeechOutputProvider.speak(`버스를 대기 중입니다. 화면을 터치하면 버스 도착까지 남은 시간을 알 수 있습니다.`);
            break;
        }
        case "arrivalDestination": {
            isPageInit && VibrationProvider.vibrate(5000);
            SpeechOutputProvider.speak(`목적지에 도착했습니다.`);
            break;
        }
    }
}


/** ReserveBus 컴포넌트 */
export default function ReserveBus() {
    /* State */
    const [reserveStep, setReserveStep] = useState<{ prev: ReserveBusStep, curr: ReserveBusStep }>({ prev: "searchStation", curr: "searchStation" });
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [reservedBus, setReservedBus] = useState<{ station: Station; bus: Bus, reservationId: string } | null>(null);
    const [boardingVehId, setBoardingVehId] = useState<string | null>(null);
    const [destinations, setDestinations] = useState<Station[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<Station | null>(null);



    /* Handler */
    /** 페이지 상태에 따른 알맞는 컨트롤러 반환 */
    const getControllerForm = () => {
        switch (reserveStep.curr) {
            case "searchStation": {
                return <SearchStation
                    setReserveStep={setReserveStep}
                    setStations={setStations}
                />;
            }
            case "selectStation": {
                return <SelectStation
                    setReserveStep={setReserveStep}
                    stations={stations}
                    setSelectedStation={setSelectedStation}
                    setBuses={setBuses}
                />;
            }
            case "selectBus": {
                return <SelectBus
                    setReserveStep={setReserveStep}
                    selectedStation={selectedStation!}
                    buses={buses}
                    setReservedBus={setReservedBus}
                />
            }
            case "waitingBus": {
                return <WaitingBus
                    setReserveStep={setReserveStep}
                    reservedBus={reservedBus!}
                    setBoardingVehId={setBoardingVehId}
                    setDestinations={setDestinations}
                />
            }
            case "arrivalBus": {
                return <ArrivalBus
                    setReserveStep={setReserveStep}
                    reservedBus={reservedBus!}
                />
            }
            case "selectDestination": {
                return <SelectDestination
                    setReserveStep={setReserveStep}
                    reservedBus={reservedBus!}
                    destinations={destinations.slice(1)}
                    setSelectedDestination={setSelectedDestination}
                />
            }
            case "waitingDestination": {
                return <WaitingDestination
                    setReserveStep={setReserveStep}
                    boardingVehId={boardingVehId!}
                    destinations={destinations}
                    selectedDestination={selectedDestination!}
                />
            }
            case "arrivalDestination": {
                return <ArrivalDestination
                    selectedDestination={selectedDestination!}
                />
            }
            default: {
                return <></>;
            }
        }
    };


    /* Effect */
    useEffect(() => {
        stepAnnouncement(reserveStep.curr, true);
    }, [reserveStep])


    // Render
    return (
        <Wrapper>
            <Title onClick={() => stepAnnouncement(reserveStep.curr, false)}>
                {stepToTitle(reserveStep.curr)}
            </Title>
            <Contents>
                {getControllerForm()}
            </Contents>
        </Wrapper>
    );
}


const Wrapper = styled.div`
    height: 100%;
    width: 100%;
`;


const Title = styled.div`
    height: 40px;
    border-bottom: 1px dashed var(--main-border-color);
    margin-bottom: 4px;
    padding: 10px;
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
    user-select: none;    
`;


const Contents = styled.div`
    height: calc(100% - 65px);
    width: 100%;
`;