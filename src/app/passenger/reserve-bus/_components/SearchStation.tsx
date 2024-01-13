"use client"

import { useRef, useState } from "react";
import { SpeechInputProvider, SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import LoadingAnimation from "@/app/_components/LoadingAnimation";
import { ReserveBusStep } from "./ReserveBus";
import { VibrationProvider } from "@/core/modules/vibration/VibrationProvider";
import styled from "styled-components";
import { getStations } from "@/core/api/blindrouteApi";
import { Station } from "@/core/type/Station";
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";



/** SearchStation 컴포넌트 프로퍼티 */
interface SearchStationProps {
    setReserveStep: React.Dispatch<React.SetStateAction<{ prev: ReserveBusStep; curr: ReserveBusStep; }>>;
    setStations: React.Dispatch<React.SetStateAction<Station[]>>;
}



/** SearchStation 컴포넌트 */
export default function SearchStation({ setReserveStep, setStations }: SearchStationProps) {
    // Const
    const router = useRouter();


    // Refs
    const audioContainer = useRef<HTMLAudioElement>(null);
    const audioSource = useRef<HTMLSourceElement>(null);


    // States
    const [isLoading, setIsLoading] = useState(false);
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [stationName, setStationName] = useState<string>("");


    // Handler
    /** 안내 음성 */
    const handleAnnouncement = (type: "noWordsDetected" | "noStationsFound") => {
        //return;
        switch (type) {
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


    /** 버스 정류장 이름 음성 인식 */
    const handleStationNameSTT = () => {
        SpeechInputProvider.startRecognition((result: string) => {
            const maxLength = 30;
            const inputText = Array.from(result).slice(0, maxLength).join('');
            setStationName(inputText);
        });
    };


    /** 이전 단계로 이동 */
    const handleBackToHome = () => {
        setIsLoading(false);
        router.replace("./");
    }


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
                    setReserveStep({
                        prev: "searchStation",
                        curr: "selectStation"
                    })
                } else {
                    handleAnnouncement("noStationsFound");
                }
            });
        }
    };


    /** 음성 인식 시작 및 종료 */
    const handleVoiceRecognition = (recognizingType: boolean) => {
        setTimeout(() => {
            SpeechOutputProvider.stopSpeak();
            if (recognizingType) {
                SpeechInputProvider.stopRecognition();
            } else {
                handleStationNameSTT();
            }
        }, 200);
    };


    /** horizontal 스와이프 이벤트 */
    const handleHorizontalSwiper = useSwipeable({
        onSwipedLeft: () => {
            setIsLoading(true);
            VibrationProvider.vibrate(1000);
            setTimeout(() => { handleGetStations(); }, 1000);
        },
        onSwipedRight: () => {
            VibrationProvider.vibrate(1000);
            setIsLoading(true);
            handleBackToHome();
        },
        trackMouse: true
    });


    // Render
    return (
        <Wrapper {...handleHorizontalSwiper}>
            <LoadingAnimation active={isLoading} />
            <audio ref={audioContainer}>
                <source ref={audioSource} />
            </audio>

            <StationNameContainer>
                <div></div>
                <TextareaStationName placeholder="정류장 입력" maxLength={50} value={stationName} onChange={(e) => setStationName(e.target.value)} />
                <ButtonVoiceRecognition onClick={() => {
                    handleVoiceRecognition(isRecognizing);
                    setIsRecognizing(!isRecognizing);
                }}>
                    {isRecognizing ? "음성인식 종료" : "음성인식 시작"}
                </ButtonVoiceRecognition>
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
    width: 85%;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
    display: flex;
    flex-direction: column;
    justify-content: space-between; 
    align-items: center;
    padding: 2vw 0;
`;


const TextareaStationName = styled.textarea`
    width: 95%;
    height: 30vw;
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

const ButtonVoiceRecognition = styled.button`
    width: 92%;
    height: 15vw;
    font-size: 5vw;
    border: 1px solid var(--main-border-color);
    border-radius: 8px;
    background-color: var(--main-color);
    color: var(--main-font-color);
    user-select: none;
    margin-bottom: 2vw;
`;