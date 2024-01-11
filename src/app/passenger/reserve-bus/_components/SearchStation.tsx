"use client"

import { useEffect, useRef, useState } from "react";
import { SpeechInputProvider, SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { ReserveBusStep } from "./ReserveBus";
import useTouchHoldEvents from "@/core/hooks/useTouchHoldEvents";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import styled from "styled-components";
import useTouchEvents from "@/core/hooks/useTouchEvents";
import { getStations } from "@/core/api/blindrouteApi";
import { Station } from "@/core/type/Station";



/** SearchStation 컴포넌트 프로퍼티 */
export interface SearchStationProps {
    setCurrStep: React.Dispatch<React.SetStateAction<ReserveBusStep>>;
    setStations: React.Dispatch<React.SetStateAction<Station[]>>;
}



/** SearchStation 컴포넌트 */
export default function SearchStation({ setCurrStep, setStations }: SearchStationProps) {
    // Refs
    const audioContainer = useRef<HTMLAudioElement>(null);
    const audioSource = useRef<HTMLSourceElement>(null);


    // States
    const [isLoading, setIsLoading] = useState(false);
    const [stationName, setStationName] = useState<string>("");


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "guide" | "noWordsDetected" | "noStationsFound") => {
        //return;
        switch (type) {
            case "guide": {
                SpeechOutputProvider.speak("화면을 누르고 있으면 음성인식이 됩니다. 손을 떼면 음성인식된 내용으로 정류장 검색을 진행합니다.");
                break;
            }
            case "noWordsDetected": {
                SpeechOutputProvider.speak("인식된 단어가 없습니다. 다시 시도해주세요.");
                break;
            }
            case "noStationsFound": {
                SpeechOutputProvider.speak(`'${stationName}'가 이름에 포함된 정류장이 없습니다`);
                break;
            }
        }
    }


    /** 음성 인식 효과음 */
    const handlePlayVoiceRecognitionAudio = () => {
        if (audioContainer.current && audioSource.current) {
            audioContainer.current.pause();
            audioSource.current.src = `/sounds/voice_recognition.mp3`;
            audioContainer.current.load();
            audioContainer.current.volume = 0.7;
            audioContainer.current.loop = false;
            audioContainer.current.play();
        }
    };


    /** 버스 정류장 이름 음성 인식 */
    const handleStationNameSTT = () => {
        SpeechInputProvider.startRecognition((result: string) => {
            const maxLength = 30;
            const inputText = Array.from(result).slice(0, maxLength).join('');
            setStationName(inputText);
        });
    };


    /** 버스 데이터 가져오기 */
    const handleGetStations = () => {
        if (stationName === "") {
            handleAnnouncement("noWordsDetected");
            setIsLoading(false);
        } else {
            getStations(stationName).then(({ msg, itemList }) => {
                setIsLoading(false);
                if (msg === "정상적으로 처리되었습니다." && itemList.length > 0) {
                    setStations(itemList);
                    setCurrStep("selectStation");
                } else {
                    handleAnnouncement("noStationsFound");
                }
            });
        }
    };


    /** 음성 인식 시작 및 종료 */
    const handleVoiceRecognition = useTouchHoldEvents({
        onTouchStart: () => {
            SpeechOutputProvider.stopSpeak();
            handlePlayVoiceRecognitionAudio();
            VibrationProvider.vibrate(1000);
            setTimeout(() => { handleStationNameSTT(); }, 1000);
        },
        onTouchEnd: () => {
            SpeechInputProvider.stopRecognition();
            handlePlayVoiceRecognitionAudio();
            VibrationProvider.vibrate(1000);

            setIsLoading(true);
            setTimeout(() => { handleGetStations(); }, 1000);
        },
        touchDuration: 2000
    });


    /** 터치 이벤트 */
    const handleSearchStation = useTouchEvents({
        onSingleTouch: () => {
            VibrationProvider.vibrate(1000);
            handleAnnouncement("guide");
        },
        onDoubleTouch: () => {
            VibrationProvider.repeatVibrate(500, 200, 2);
            setIsLoading(true);
            setTimeout(() => { handleGetStations(); }, 1000);
        }
    });


    // Effects
    useEffect(() => {
        setTimeout(() => { handleAnnouncement("guide"); }, 400);
    }, [setCurrStep, setStations]);


    // Render
    return (
        <Wrapper>
            <LoadingAnimation active={isLoading} />
            <audio ref={audioContainer}>
                <source ref={audioSource} />
            </audio>

            <StationNameContainer
                onClick={handleSearchStation}
                onTouchStart={handleVoiceRecognition.handleTouchStart}
                onTouchEnd={handleVoiceRecognition.handleTouchEnd}
            >
                <TextareaStationName placeholder="정류장 입력" maxLength={50} value={stationName} onChange={(e) => setStationName(e.target.value)} />
            </StationNameContainer>
        </Wrapper>
    );
}


const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;


const StationNameContainer = styled.div`
    height: 90%;
    width: 90%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
    font-size: 7vw;
    font-weight: 550;
    display: flex;
    justify-content: center;
    align-items: center;
`;


const TextareaStationName = styled.textarea`
    width: 95%;
    height: 25vw;
    border: 0;
    background-color: var(--button-color);
    color: var(--button-text-color);
    font-size: 7vw;
    font-weight: bold;
    text-align: center;
    resize: none;
    user-select: none;
    &:focus {
        outline: none;  // 포커스 시 아웃라인 제거
    }
`;