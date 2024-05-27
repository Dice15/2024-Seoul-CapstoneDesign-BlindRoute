"use client"

import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Station } from "@/core/type/Station";
import SelectStart from "./SelectStart";
import { useRouter, useSearchParams } from "next/navigation";
import LocationConfirm from "./LocationConfirm";
import SelectDestination from "./SelectDestination";
import { IRouting } from "@/core/type/IRouting";
import RoutingConfirm from "./RoutingConfirm";
import ReservationConfirm from "./ReservationConfirm";
import WaitingBus from "./WaitingBus";


export type PathFinderStep = "locationConfirm" | "selectStart" | "selectDestination" | "routingConfirm" | "reservationConfirm" | "waitingBus" | "boardingConfirm" | "quitConfirm";


function stepTitle(step: PathFinderStep): string {
    switch (step) {
        case "locationConfirm": return "출발지 및 도착지 확인";
        case "selectStart": return "출발지 선택";
        case "selectDestination": return "도착지 선택";
        case "routingConfirm": return "경로 확인";
        case "reservationConfirm": return "버스 예약";
        case "reservationConfirm": return "버스 대기";
        default: return "알 수 없는 단계";
    }
}


export default function PathFinder() {
    // hook
    const router = useRouter();


    // hook
    const searchParams = useSearchParams();


    // state
    const [step, setStep] = useState<PathFinderStep>("routingConfirm");
    const [locations, setLocations] = useState<{ start: string; destination: string; } | null>(null);
    const [start, setStart] = useState<Station | null>(null);
    const [destination, setDestination] = useState<Station | null>(null);
    const [routing, setRouting] = useState<IRouting | null>(null);
    const [forwardIndex, setForwardIndex] = useState<number>(0);
    const [onBoardVehId, setOnBoardVehId] = useState<string | null>(null);


    // handler
    const getControllerForm = useCallback(() => {
        switch (step) {
            case "locationConfirm": {
                return <LocationConfirm
                    locations={locations}
                    setStep={setStep}
                />;
            }
            case "selectStart": {
                return <SelectStart
                    locations={locations}
                    setStep={setStep}
                    setStart={setStart}
                />;
            }
            case "selectDestination": {
                return <SelectDestination
                    locations={locations}
                    setStep={setStep}
                    setDestination={setDestination}
                />;
            }
            case "routingConfirm": {
                return <RoutingConfirm
                    setStep={setStep}
                    start={start}
                    destination={destination}
                    routing={routing}
                    setRouting={setRouting}
                    setForwardIndex={setForwardIndex}
                />;
            }
            case "reservationConfirm": {
                if ((routing?.forwarding.length || 0) <= forwardIndex) {
                    router.replace('/chatbot');
                    return <></>;
                }
                return <ReservationConfirm
                    setStep={setStep}
                    forwarding={routing ? routing.forwarding[forwardIndex] : null}
                />
            }
            case "waitingBus": {
                return <WaitingBus
                    setStep={setStep}
                    forwarding={routing ? routing.forwarding[forwardIndex] : null}
                    setOnBoardVehId={setOnBoardVehId}
                />
            }
            default: {
                return <></>;
            }
        }
    }, [router, locations, step, start, destination, routing, forwardIndex]);


    // effect
    useEffect(() => {
        if (searchParams) {
            setLocations({
                start: searchParams.get('start') ?? "",
                destination: searchParams.get('destination') ?? ""
            });
        }
    }, [searchParams]);


    // render
    return (
        <Wrapper>
            <Title tabIndex={10}>
                {stepTitle(step)}
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