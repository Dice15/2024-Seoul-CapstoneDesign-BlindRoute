# BlindRoute (시각장애인 버스 예약 서비스)
<p>서울시 어디서든 시각장애인이 버스 승하차를 도와주는 모바일 웹앱 서비스</p>

*(이 문서는 1차 벨류업 프로젝트 기준으로 작성되어 있습니다)*

</br>

# 프로젝트 개요
<h3>2차 벨류업 (2024.04 ~ 진행중)</h3>
<p>-> SKT 기업사회맞춤형 캡스톤 디자인 (TMap, A dot, GPT4o 활용)</p>
</br>

<h3>1차 벨류업 (2023.12 ~ 2024.01)</h3>
<p>-> 2023 서울 지역사회공헌 캡스톤디자인 Fair 우수상, 혁신상</p>

|전공|이름|역할|주요 업무|기술 스택|
|-------|-----|-----|-----|-----|
|컴퓨터공학전공|문정훈|팀장|Front-End & Back-End|![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) ![React.js](https://img.shields.io/badge/React.js-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)|
|컴퓨터공학전공|손기민|팀원|웹 테스팅, 문서관리, 발표||
|컴퓨터공학전공|정채우|팀원|복지관/교수와 인터뷰||
</br>

<h3>초기 프로젝트 (2023.03 ~ 2023.11)</h3>
<p>-> 2023 동국대학교 겨울 ICIP & 캡스톤디자인 우수상</p>

|전공|이름|역할|주요 업무|기술 스택|
|-------|-----|-----|-----|-----|
|컴퓨터공학전공|문정훈|팀장|Front-End|![React.js](https://img.shields.io/badge/React.js-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)|
|컴퓨터공학전공|남동호|팀원|Back-End|![Spring](https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=spring&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white) ![Oracle DB](https://img.shields.io/badge/Oracle%20DB-F80000?style=flat-square&logo=oracle&logoColor=white)|
|컴퓨터공학전공|김준섭|팀원|버스번호판 인식|![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white) ![YOLO v5](https://img.shields.io/badge/YOLO%20v5-000000?style=flat-square)|
|컴퓨터공학전공|정채우|팀원|버스 번호 추출|![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![VOLO OCR](https://img.shields.io/badge/VOLO%20OCR-000000?style=flat-square)|
</br>

# UI/UX 설계
<h3>다음 자료를 참고하여 설계</h3>
<ul>
  <li>한국시각장애인복지관과 인터뷰 진행</li>
  <li>방송통신표준심의회 시각장애인 애플리케이션 콘텐츠 지침 참고</li>
  <li>중앙대학교 시각장애인을 위한 앱 디자인 논문 참고</li>
  <li>Google Talkback 기본 동작 가이드 (안드로이드OS 시각장애인 설정)</li>
</ul>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/6eecc19e-de1c-4e61-8efd-743375b4e631" width="700">
</br>
</br>
</br>

# 배포 사이트 (모바일 환경 지원)
<h3>데스크톱은 F12(개발자 도구)를 통해 모바일 설정 권장</h3>
<h3>웹 사이트 : https://blindroute.vercel.app (게스트 로그인 가능)</h3>
<h3>시연 영상 : https://youtu.be/ELm7Vdc6aMQ </h3>
</br>
</br>


# 데모 시연
<h3>시나리오</h3>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/d4d31eae-a14e-4562-87a8-06db2676921c" width="700"> 
<h3>※ 음성입력/안내가 있으므로 원본영상을 시청하는 것을 추천합니다 ※</h3>
<h3>유튜브 : https://youtu.be/ELm7Vdc6aMQ</h3>
</br>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/1bcfbb03-6e47-417b-a1db-13085fe2333d" width="700">
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/df30918f-cb31-4f31-b4bc-54d13333d5b2" width="700">
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/023313ab-a036-4299-8221-99c27052566a" width="700">
</br>
</br>


# API 명세서
<h3>서울시 BIS API를 기반으로 제작</h3>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/e5198f37-3ef3-470a-b5ab-b4400e84edff" width="700"> 
</br>
</br>

# 수상
![image](https://github.com/Dice15/BlindRoute/assets/102275981/45291781-0185-45df-8585-7e0a2bb1f8f2)

</br>
</br>

# 소스코드 바로가기
- 사용자 웹 페이지 구현 : [userpage](src/app/passenger)
- API 및 Auth 구현 : [apiroutes](src/pages/api)
- 미들 웨어 구현 : [middleware](src/middleware.ts)
</br>
</br>
