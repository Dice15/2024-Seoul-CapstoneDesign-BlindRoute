"use client"

import { useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
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



/** 예약 단계 */
export type ReserveBusStep = "searchStation" | "selectStation" | "selectBus" | "waitingBus" | "arrival" | "selectDestination" | "waitingDestination" | "arrivalDestination";



/** ClientSearch 컴포넌트 */
export default function ReserveBus() {
    /* Ref */
    const reserveStepsRef = useRef(null);


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
            case "arrival": {
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


    /** 페이지 이동 애니메이션 */
    const getAnimationDirection = (): "left" | "right" => {
        const stepIdx: ReserveBusStep[] = ["searchStation", "selectStation", "selectBus", "waitingBus", "arrival", "selectDestination"];
        const prevIdx = stepIdx.indexOf(reserveStep.prev);
        const currIdx = stepIdx.indexOf(reserveStep.curr);
        return currIdx >= prevIdx ? 'left' : 'right';
    };


    /** 클래스 이름 설정 */
    const getAnimationStyles = (direction: 'left' | 'right') => ({
        enter: `${direction}SlideEnter`,
        enterActive: `${direction}SlideEnterActive`,
        exit: `${direction}SlideExit`,
        exitActive: `${direction}SlideExitActive`,
    });


    // Render
    return (
        <TransitionGroupWrapper>
            <CSSTransition
                nodeRef={reserveStepsRef}
                key={`${reserveStep.prev}${reserveStep.curr}`}
                timeout={300}
            >
                <ReserveSteps ref={reserveStepsRef}>
                    {getControllerForm()}
                </ReserveSteps>
            </CSSTransition>
        </TransitionGroupWrapper>
    );
}


const TransitionGroupWrapper = styled(TransitionGroup)`
    height: 100%;
    width: 100%;
`;


const ReserveSteps = styled.div`
    height: 100%;
    width: 100%;
`;