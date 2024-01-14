"use client"

import { useCallback, useEffect, useState } from "react";
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
import { Boarding } from "@/core/type/Boarding";



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
    const delay = isPageInit ? 700 : 0;

    for (let i = 0; i < delay; i += 50) {
        setTimeout(() => { SpeechOutputProvider.speak(" "); }, i);
    }

    setTimeout(() => {
        switch (step) {
            case "searchStation": {
                //SpeechOutputProvider.speak("정류장 검색 페이지입니다. 텍스트 입력 또는 음성인식으로 검색할 수 있습니다.");
                isPageInit && VibrationProvider.vibrate(1000);
                break;
            }
            case "selectStation": {
                //SpeechOutputProvider.speak(`정류장을 선택하세요. 위아래 스와이프로 정류장을 선택할 수 있습니다.`);
                isPageInit && VibrationProvider.vibrate(1000);
                break;
            }
            case "selectBus": {
                //SpeechOutputProvider.speak(`버스를 선택하세요. 위아래 스와이프로 버스를 선택할 수 있습니다.`);
                isPageInit && VibrationProvider.vibrate(1000);
                break;
            }
            case "waitingBus": {
                //SpeechOutputProvider.speak(`버스를 대기 중입니다. 화면을 터치하면 버스 도착까지 남은 시간을 알 수 있습니다.`);
                isPageInit && VibrationProvider.vibrate(1000);
                break;
            }
            case "arrivalBus": {
                //SpeechOutputProvider.speak(`버스가 도착했습니다. ${isPageInit ? "10초 뒤" : "잠시 후"} 자동으로 목적지 선택 페이지로 이동합니다.`);
                isPageInit && VibrationProvider.vibrate(5000);
                break;
            }
            case "selectDestination": {
                //SpeechOutputProvider.speak(`목적지를 선택하세요. 위아래 스와이프로 정류장을 선택할 수 있습니다.`);
                isPageInit && VibrationProvider.vibrate(1000);
                break;
            }
            case "waitingDestination": {
                //SpeechOutputProvider.speak(`목적지 대기 중입니다. 화면을 터치하면 목적지까지 남은 정류장의 수를 알 수 있습니다.`);
                isPageInit && VibrationProvider.vibrate(1000);
                break;
            }
            case "arrivalDestination": {
                //SpeechOutputProvider.speak(`목적지에 도착했습니다. ${isPageInit ? "10초 뒤" : "잠시 후"} 자동으로 홈 페이지로 이동합니다.`);
                isPageInit && VibrationProvider.vibrate(5000);
                break;
            }
        }
    }, delay);
}


/** ReserveBus 컴포넌트 */
export default function ReserveBus() {
    /* State */
    const [step, setStep] = useState<ReserveBusStep>("searchStation");
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [boarding, setBoarding] = useState<Boarding | null>(null);
    const [destinations, setDestinations] = useState<Station[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<Station | null>(null);


    /* Handler */
    /** 페이지 상태에 따른 알맞는 컨트롤러 반환 */
    const getControllerForm = useCallback(() => {
        switch (step) {
            case "searchStation": {
                return <SearchStation
                    setStep={setStep}
                    setStations={setStations}
                />;
            }
            case "selectStation": {
                return <SelectStation
                    setStep={setStep}
                    stations={stations}
                    setSelectedStation={setSelectedStation}
                    setBuses={setBuses}
                />;
            }
            case "selectBus": {
                return <SelectBus
                    setStep={setStep}
                    selectedStation={selectedStation!}
                    buses={buses}
                    setBoarding={setBoarding}
                />
            }
            case "waitingBus": {
                return <WaitingBus
                    setStep={setStep}
                    boarding={boarding!}
                    setBoarding={setBoarding}
                    setDestinations={setDestinations}
                />
            }
            case "arrivalBus": {
                return <ArrivalBus
                    setStep={setStep}
                    boarding={boarding!}
                />
            }
            case "selectDestination": {
                return <SelectDestination
                    setStep={setStep}
                    boarding={boarding!}
                    destinations={destinations.slice(1)}
                    setSelectedDestination={setSelectedDestination}
                />
            }
            case "waitingDestination": {
                return <WaitingDestination
                    setStep={setStep}
                    boarding={boarding!}
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
    }, [boarding, buses, destinations, selectedDestination, selectedStation, stations, step]);


    /* Effect */
    /** 페이지 랜더링 시 음성안내 */
    useEffect(() => {
        stepAnnouncement(step, true);
    }, [step])


    // Render
    return (
        <Wrapper>
            <Title onClick={() => stepAnnouncement(step, false)} tabIndex={10}>
                {stepToTitle(step)}
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