// "use client"

// import { Station } from "@/core/type/Station";
// import { ReserveBusStep } from "./ReserveBus";
// import { useState } from "react";
// import { SpeechOutputProvider } from "@/core/modules/speech/SpeechProviders";


// export interface WaitingDestinationProps {
//     setReserveStep: React.Dispatch<React.SetStateAction<{ prev: ReserveBusStep; curr: ReserveBusStep; }>>;
//     boardingVehId: string;
//     selectedDestination: Station;
// }


// export default function WaitingDestination({ setReserveStep, selectedDestination }: WaitingDestinationProps) {
//     // States
//     const [waitingMsg, setWaitingMsg] = useState("대기중");
//     const [isLoading, setIsLoading] = useState(false);
//     const [busArrInfo, setBusArrInfo] = useState<{ arrmsg: string; vehId: string; } | null>(null);


//     // Handler
//     /** 안내 음성 */
//     const handleAnnouncement = (type: "guide") => {
//         //return;
//         switch (type) {
//             case "guide": {
//                 SpeechOutputProvider.speak(`"${selectedDestination.stNm}",에 하차 등록이 되었습니다. 화면을 두번 터치를 하면 예약을 취소합니다`);
//                 break;
//             }
//         }
//     }


//     /** 버스 예약 취소 */
//     const handleCancelReservation = () => {
//         cancelReservation().then(({ msg, deletedCount }) => {
//             setIsLoading(false);
//             setReserveStep({
//                 prev: "waitingBus",
//                 curr: "selectBus"
//             });
//         });
//     }


//     /** 버스 도착하면 예약을 삭제하고 해당 버스의 도착지를 받아옴 */
//     const handleArrivedBus = () => {
//         cancelReservation().then(({ msg, deletedCount }) => {
//             getDestinationByRoute(reservedBus.bus.busRouteId, busArrInfo!.vehId).then(({ msg, itemList }) => {
//                 setIsLoading(false);
//                 if (msg === "정상적으로 처리되었습니다." && itemList.length > 0) {
//                     const stIdx = itemList.findIndex((item) => item.stNm === reservedBus.station.stNm);
//                     setDestinations(itemList.slice(stIdx + 1));
//                 }
//                 setReserveStep({
//                     prev: "waitingBus",
//                     curr: "arrival"
//                 });
//             });
//         });
//     }


//     /** horizontal 스와이프 이벤트 */
//     const handleHorizontalSwiper = useSwipeable({
//         onSwipedRight: () => {
//             setIsLoading(true);
//             handleCancelReservation();
//         },
//         trackMouse: true
//     });


//     /** 화면 터치 이벤트 */
//     const handleBusInfoClick = useTouchEvents({
//         onSingleTouch: () => {
//             VibrationProvider.vibrate(1000);
//             handleAnnouncement("guide");
//         },
//         onDoubleTouch: () => {
//             VibrationProvider.repeatVibrate(500, 200, 2);
//             setIsLoading(true);
//             handleCancelReservation();
//         },
//     });


//     // Effects
//     /** 대기중 메시지 이벤트 */
//     useEffect(() => {
//         setTimeout(() => { handleAnnouncement("guide"); }, 400);
//     }, [reservedBus]);


//     useEffect(() => {
//         const intervalId = setInterval(() => {
//             setWaitingMsg(prevMessage => {
//                 if (prevMessage === "대기중") return "대기중.";
//                 if (prevMessage === "대기중.") return "대기중..";
//                 if (prevMessage === "대기중..") return "대기중...";
//                 return "대기중";
//             });
//         }, 1000);

//         return () => {
//             clearInterval(intervalId);
//         }
//     }, [setWaitingMsg]);



//     /** 예약한 버스가 도착했는지 2초마다 확인함 */
//     useEffect(() => {
//         const intervalId = setInterval(async () => {
//             const newArrInfo = (await getReservedBusArrInfo(reservedBus.reservationId)).busArrInfo;
//             if (newArrInfo !== null) {
//                 if (busArrInfo !== null) {
//                     if (newArrInfo.vehId !== busArrInfo.vehId) {
//                         setIsLoading(true);
//                         handleArrivedBus();
//                     }
//                 } else {
//                     setBusArrInfo(newArrInfo);
//                 }
//             }
//         }, 2000);

//         return () => {
//             clearInterval(intervalId);
//         }
//     }, [reservedBus, busArrInfo, setBusArrInfo]);


//     // Render
//     return (
//         <Wrapper {...handleHorizontalSwiper}>
//             <LoadingAnimation active={isLoading} />
//             <ReservationContainer
//                 onClick={handleBusInfoClick}
//             >
//                 <ReservationDestinationName>{reservedBus.bus.busRouteAbrv}</ReservationDestinationName>
//                 <WiatingMessage>{waitingMsg}</WiatingMessage>
//             </ReservationContainer>
//         </Wrapper >
//     );
// }


// const Wrapper = styled.div`
//     height: 100%;
//     width: 100%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
// `;


// const ReservationContainer = styled.div`
//     height: 90%;
//     width: 85%;
//     border: 1px solid var(--main-border-color);
//     border-radius: 8px;
//     background-color: var(--main-color);
//     color: var(--main-font-color);
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     align-items: center;
// `;


// const ReservationDestinationName = styled.h1`
//     font-size: 7vw;
//     font-weight: bold;
//     cursor: pointer;
//     user-select: none;
// `;

// const WiatingMessage = styled.h3`
//     font-size: 5vw;
//     font-weight: bold;
//     cursor: pointer;
//     user-select: none;
// `;
