"use client"

import styled from "styled-components";
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { SpeechInputProvider, SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import { getChatAdot } from "@/core/api/blindrouteApi";
import axios from 'axios';

export default function ChatAdot() {
    const [userMessage, setUserMessage] = useState("");
    const [adotMessage, setAdotMessage] = useState("");


    const handleSubmitText = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setUserMessage(event.currentTarget.value);
            setAdotMessage("");
            event.currentTarget.value = "";
            event.preventDefault();
        }
    }, []);


    const handleSubmitSpeak = useCallback(() => {
        SpeechOutputProvider.stopSpeak();
        SpeechInputProvider.startRecognition((result: string) => {
            const maxLength = 30;
            const inputText = Array.from(result).slice(0, maxLength).join('');
            setUserMessage(inputText);
            setAdotMessage("");
            if (inputText.length === maxLength) SpeechInputProvider.stopRecognition();
        });
    }, []);


    useEffect(() => {
        if (adotMessage.length > 0) {
            SpeechOutputProvider.speak(adotMessage);
        }
    }, [adotMessage])

    //"@blindroute{ start: 수정된 출발지, destination: 수정된 도착지 }"
    useEffect(() => {
        if (userMessage.length > 0) {
            getChatAdot(userMessage).then(({ msg, message }) => {
                if (message.startsWith("@blindroute")) {
                    const pattern = /@blindroute\{ start: (.*?), destination: (.*) \}/;
                    const match = message.match(pattern);
                    if (match) {
                        const route = {
                            start: match[1],
                            destination: match[2]
                        };
                        setAdotMessage(`${route.start}에서 ${route.destination}로 경로 안내를 시작하겠습니다.`);
                    }
                    else {
                        setAdotMessage("답변 중 오류가 발생했습니다. 다시 말해주세요.");
                    }
                } else {
                    setAdotMessage(message);
                }
            });
        }
    }, [userMessage])

    useEffect(() => {
        const options = {
            method: 'POST',
            url: 'https://apis.openapi.sk.com/transit/routes',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                appKey: 'e8wHh2tya84M88aReEpXCa5XTQf3xgo01aZG39k5'
            },
            data: {
                startX: '126.926493082645',
                startY: '37.6134436427887',
                endX: '127.126936754911',
                endY: '37.5004198786564',
                lang: 0,
                format: 'json',
                count: 10,
                searchDttm: '202301011200'
            }
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.error(error);
            });
    }, []);


    return (
        <Wrapper>
            <BackImage>
                <Image src="/images/chat_adot_background.png" alt="guide01" fill priority />
            </BackImage>

            <UserMessage>{userMessage}</UserMessage>
            {adotMessage.length > 0 ? <ReturnMessage>{adotMessage}</ReturnMessage> : <></>}

            <MessageInputField>
                <TextInputField>
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        onKeyDown={handleSubmitText}
                        style={{ width: '100%', height: '100%' }}
                    />
                </TextInputField>
                <SpeakInputField
                    onClick={handleSubmitSpeak}>
                </SpeakInputField>
            </MessageInputField>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const BackImage = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 100;
`;

const UserMessage = styled.p`
    position: fixed;
    top: 25%;
    width: calc(100% - 14%);
    margin: 2% 7%;
    z-index: 101;
    font-size: 1.2em;
    font-weight: bold;
    color: #666e7e;
    white-space: normal; 
    overflow-wrap: break-word;
`;

const ReturnMessage = styled.p`
    position: fixed;
    top: 35%;
    width: calc(100% - 14% - 3%);
    margin: 2% 7%;
    padding-left: 3%;
    border-left: 0.2em solid #666e7e;
    z-index: 101;
    font-size: 1.2em;
    font-weight: bold;
    color: #666e7e;
    white-space: normal;
    overflow-wrap: break-word;
`;


const MessageInputField = styled.div`
    position: fixed;
    top: 82%;
    height: 6.5%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 101;
`;

const TextInputField = styled.div`
    margin-left: 10%;
    height: 100%;
    width: 70%;
    padding: 0;
`;

const SpeakInputField = styled.div`
    height: 100%;
    width: 10%;
`;