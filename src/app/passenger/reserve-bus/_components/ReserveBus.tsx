"use client"

import { useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import SearchStation from "./SearchStation";
import styled from "styled-components";
import { Station } from "@/core/type/Station";
import SelectStation from "./SelectStation";
import { Bus } from "@/core/type/Bus";
import SelectBus from "./SelectBus";
import WaitingBus from "./WaitingBus";



/** 컨트롤러 상태 */
export type ReserveBusStep = "searchStation" | "selectStation" | "selectBus" | "waiting" | "arrival" | "gettingOff";



/** ClientSearch 컴포넌트 */
export default function ReserveBus() {
    /* Ref */
    const reserveStepsRef = useRef(null);


    /* State */
    const [prevStep, setPrevStep] = useState<ReserveBusStep>("searchStation");
    const [currStep, setCurrStep] = useState<ReserveBusStep>("searchStation");
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [reservedBus, setReservedBus] = useState<{ bus: Bus, reservationId: string } | null>(null);


    /* Handler */
    /** 페이지 상태에 따른 알맞는 컨트롤러 반환 */
    const getControllerForm = () => {
        switch (currStep) {
            case "searchStation": {
                return <SearchStation
                    setCurrStep={setCurrStep}
                    setStations={setStations}
                />;
            }
            case "selectStation": {
                return <SelectStation
                    setCurrStep={setCurrStep}
                    stations={stations}
                    setSelectedStation={setSelectedStation}
                    setBuses={setBuses}
                />;
            }
            case "selectBus": {
                return <SelectBus
                    setCurrStep={setCurrStep}
                    selectedStation={selectedStation!}
                    buses={buses}
                    setReservedBus={setReservedBus}
                />
            }
            case "waiting": {
                return <WaitingBus
                    setCurrStep={setCurrStep}
                    reservedBus={reservedBus!}
                />
            }
            default: {
                return <></>;
            }
        }
    };


    /** 페이지 이동 애니메이션 */
    const getAnimationDirection = (): "left" | "right" => {
        const stepIdx: ReserveBusStep[] = ["searchStation", "selectStation", "selectBus", "waiting", "arrival", "gettingOff"];
        const currIdx = stepIdx.indexOf(currStep);
        const prevIdx = stepIdx.indexOf(prevStep);
        return currIdx >= prevIdx ? 'left' : 'right';
    };


    /** 클래스 이름 설정 */
    const getAnimationStyles = (direction: 'left' | 'right') => ({
        enter: `${direction}SlideEnter`,
        enterActive: `${direction}SlideEnterActive`,
        exit: `${direction}SlideExit`,
        exitActive: `${direction}SlideExitActive`,
    });


    /* Effect */
    /** 페이지 상태가 바뀌면 이전 페이지 저장 */
    useEffect(() => {
        setPrevStep(currStep);
    }, [currStep]);


    // Render
    return (
        <TransitionGroupWrapper>
            <CSSTransition
                nodeRef={reserveStepsRef}
                key={currStep}
                timeout={300}
                classNames={getAnimationStyles(getAnimationDirection())}
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

    &.leftSlideEnter {
        transform: translateX(100%);
    }

    &.leftSlideEnterActive {
        transform: translateX(0);
        transition: transform 300ms ease-in-out;
    }

    &.leftSlideExit {
        transform: translateX(0);
    }

    &.leftSlideExitActive {
        transform: translateX(-100%);
        transition: transform 300ms ease-in-out;
    }

    &.rightSlideEnter {
        transform: translateX(-100%);
    }

    &.rightSlideEnterActive {
        transform: translateX(0);
        transition: transform 300ms ease-in-out;
    }

    &.rightSlideExit {
        transform: translateX(0);
    }

    &.rightSlideExitActive {
        transform: translateX(100%);
        transition: transform 300ms ease-in-out;
    }
`;