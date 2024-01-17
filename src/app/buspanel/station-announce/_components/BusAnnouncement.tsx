"use client"

import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { getPanelInfo, getReservationByPanel } from "@/core/api/blindrouteApi";
import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { BusPanel } from "@/core/type/BusPanel";
import { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";


interface IResInfo {
    currStNm: string;
    nextStNm: string | undefined;
    currBoardingNum: string;
    currAlightingNum: string;
}


interface IPanelText {
    title: string;
    description: string;
}


export default function BusAnnouncement() {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [panel, setPanel] = useState<BusPanel | null>(null);
    const [resInfo, setResInfo] = useState<IResInfo | null>(null);
    const [panelText, setPanelText] = useState<IPanelText | null>(null);


    // Ref
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);


    // Handle
    const handleAnnounceNextStation = useCallback((resInfo: IResInfo) => {
        const description = parseInt(resInfo.currBoardingNum) > 0 && parseInt(resInfo.currAlightingNum) > 0
            ? `,  교통약자 ${resInfo.currBoardingNum}명 승차, ${resInfo.currAlightingNum}명 하차`
            : parseInt(resInfo.currBoardingNum) > 0
                ? `,  교통약자 ${resInfo.currBoardingNum}명 승차`
                : parseInt(resInfo.currAlightingNum) > 0
                    ? `,  교통약자 ${resInfo.currAlightingNum}명 하차`
                    : "";

        const announcement = parseInt(resInfo.currBoardingNum) > 0 && parseInt(resInfo.currAlightingNum) > 0
            ? `교통약자 ${resInfo.currBoardingNum}명이 승차, ${resInfo.currAlightingNum}명이 하차 대기중입니다.`
            : parseInt(resInfo.currBoardingNum) > 0
                ? `교통약자 ${resInfo.currBoardingNum}명이 승차 대기중입니다.`
                : parseInt(resInfo.currAlightingNum) > 0
                    ? `교통약자 ${resInfo.currAlightingNum}명이 하차 대기중입니다.`
                    : "";

        setPanelText({
            title: "이번 정류장",
            description: `${resInfo.currStNm}${description}`
        });

        SpeechOutputProvider.speak(`이번 정류장은 "${resInfo.currStNm}" 입니다. 다음 정류장은 "${resInfo.nextStNm}" 입니다. ${announcement}`);

        setTimeout(() => {
            setPanelText(null);
        }, 20000);

    }, []);


    /** 현재 버스가 향하는 정류장 체크 */
    const handleCheckBusArrival = useCallback(async () => {
        if (panel === null) return;

        const newResInfo = (await getReservationByPanel(panel.busRouteId, panel.vehId)).stResInfo;
        console.log(resInfo);
        console.log(newResInfo);

        if (newResInfo !== null) {
            if (resInfo === null || newResInfo.currStNm !== resInfo.currStNm) {
                handleAnnounceNextStation(newResInfo);
            }
            setResInfo(newResInfo);
        }
    }, [handleAnnounceNextStation, panel, resInfo]);


    // Effect
    useEffect(() => {
        setIsLoading(true);
        getPanelInfo().then(({ msg, busPanel }) => {
            if (msg === "정상적으로 처리되었습니다.") {
                console.log(busPanel)
                setPanel(busPanel);
            }
            setIsLoading(false);
        });
    }, []);


    useEffect(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
        intervalIdRef.current = setInterval(handleCheckBusArrival, 4000);

        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        }
    }, [handleCheckBusArrival]);


    // Render
    return (
        <Wrapper>
            <LoadingAnimation active={isLoading} />
            <Panel>
                {panelText && <>
                    <PanelTitle>
                        {panelText.title}
                    </PanelTitle>
                    <PanelDescription>
                        <span> {panelText.description}</span>
                    </PanelDescription>
                </>}
            </Panel>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;


const Panel = styled.div`
    height: calc(30vw - 40px);
    width: calc(90vw - 40px);
    border: 20px solid #324559;
    border-radius: 20px;
    background-color: #181F2A;
`;

const PanelTitle = styled.div`
    height: 50%;
    width: 100%;
    color: #00F4F9;
    font-size: 8vw;
    font-weight: bold;
    text-align: center;
`;

const slide = keyframes`
    from {
        transform: translateX(0%);
    }
    to {
        transform: translateX(-100%);
    }
`;

const PanelDescription = styled.div`
    height: 50%;
    width: 100%;
    color: #D7E4EC;
    font-size: 8vw;
    font-weight: bold;

    white-space: nowrap; 
    overflow: hidden;

    & > span {
        display: inline-block;
        padding-left: 100%; 
        animation: ${slide} 12s linear infinite;
    }
`;
