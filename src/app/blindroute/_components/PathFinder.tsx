"use client"

import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Station } from "@/core/type/Station";
import { Bus } from "@/core/type/Bus";
import { Boarding } from "@/core/type/Boarding";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import SelectStation from "./SelectStart";
import SelectStart from "./SelectStart";
import { useSearchParams } from "next/navigation";
import LocationConfirm from "./LocationConfirm";
import SelectDestination from "./SelectDestination";


export type PathFinderStep = "locationConfirm" | "selectStart" | "selectDestination";


function stepTitle(step: PathFinderStep): string {
    switch (step) {
        case "locationConfirm": return "출발지 및 도착지 확인";
        case "selectStart": return "출발지 선택";
        case "selectDestination": return "도착지 선택";
        default: return "알 수 없는 단계";
    }
}


export default function PathFinder() {
    // hook
    const searchParams = useSearchParams();


    // state
    const [step, setStep] = useState<PathFinderStep>("locationConfirm");
    const [start, setStart] = useState<Station | null>(null);
    const [destination, setDestination] = useState<Station | null>(null);
    const [locations, setLocations] = useState<{ start: string; destination: string; } | null>(null);



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
            default: {
                return <></>;
            }
        }
    }, [locations, step]);


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