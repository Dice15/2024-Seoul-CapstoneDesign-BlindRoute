"use client"

import styled from "styled-components";
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { SpeechInputProvider, SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";
import axios from 'axios';

export default function ChatAdot() {
    const [chatId, setChatId] = useState<string | null>(null);
    const [userMessage, setUserMessage] = useState<string | null>(null);
    const [adotMessage, setAdotMessage] = useState<string | null>(null);
    const [route, setRoute] = useState<{ start: string; destination: string; } | null>(null);

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


    const extractBlindroute = (input: string) => {
        const regex = /@blindroute\{.*?\}/g;
        const match = input.match(regex);
        return match ? match[0] : null;
    }

    const parseBlindroute = (blindrouteString: string) => {
        const content = blindrouteString.match(/\{(.*?)\}/)![1];
        const pairs = content.split(', ');
        const obj: { [key: string]: string } = {};

        pairs.forEach(pair => {
            const [key, value] = pair.split(': ').map(s => s.trim());
            obj[key] = value;
        });

        return {
            start: obj.start,
            destination: obj.destination
        };
    }

    useEffect(() => {
        axios.get('/api/chatadot/createNewChat').then((value) => {
            setChatId(value.data.threadId as string);
        });
    }, []);


    useEffect(() => {
        if (userMessage && chatId) {
            axios.post('/api/chatadot/getChatResult', {
                threadId: chatId,
                userMessage: userMessage
            }).then((value) => {
                const message = value.data.message as string;
                console.log(message);

                if (message.includes("@blindroute")) {
                    const route = parseBlindroute(extractBlindroute(message) || "");
                    setAdotMessage(`${route.start}에서 ${route.destination}로 안내를 시작하겠습니다`);
                    setRoute(route);
                }
                else {
                    setAdotMessage(value.data.message as string || null);
                }
            });
        }
    }, [userMessage, chatId])


    useEffect(() => {
        if (adotMessage) {
            SpeechOutputProvider.speak(adotMessage);
        }
    }, [adotMessage])


    useEffect(() => {
        if (route) {

        }
    }, [route]);


    return (
        <Wrapper>
            <BackImage>
                <Image src="/images/chat_adot_background.png" alt="guide01" fill priority />
            </BackImage>

            <UserMessage>{userMessage || ""}</UserMessage>
            <ReturnMessage>{adotMessage || ""}</ReturnMessage>

            <MessageInputField>
                <TextInputField>
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        onKeyDown={handleSubmitText}
                        style={{ width: '100%', height: '100%', fontSize: "1.5em" }}
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
    height: calc(var(--vh, 1vh) * 100);
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
    font-size: 1.5em;
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
    font-size: 1.5em;
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
    width: 65%;
    padding: 0;
    z-index: 101;
`;

const SpeakInputField = styled.div`
    height: 100%;
    width: 10%;
    z-index: 101;
`;