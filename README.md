# BlindRoute
<p>서울시 어디서든 시각장애인이 버스 승/하차를 예약할 수 있게 해주는 모바일 웹앱 서비스</p>
</br>

# 프로젝트 개요
<h3>2023 서울 지역사회공헌 캡스톤디자인 Fair (최종 벨류업)</h3>
<p>-> 기간 : 2023.12 ~ 2024.01 / 우수상(의장상), 혁신상(회장상)</p>

|전공|이름|역할|주요 업무|기술 스택|
|-------|-----|-----|-----|-----|
|컴퓨터공학전공|문정훈|팀장|웹 풀스택 개발|![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) ![React.js](https://img.shields.io/badge/React.js-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)|
|컴퓨터공학전공|손기민|팀원|웹 테스팅, 문서관리, 발표||
|컴퓨터공학전공|정채우|팀원|복지관/교수와 인터뷰||

<h3>2023 동국대학교 겨울 ICIP & 캡스톤디자인</h3>
<p>-> 기간 : 2023.03 ~ 2023.11 / 우수상(교원상)</p>
  
|전공|이름|역할|주요 업무|기술 스택|
|-------|-----|-----|-----|-----|
|컴퓨터공학전공|문정훈|팀장|웹 프론트 개발|![React.js](https://img.shields.io/badge/React.js-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)|
|컴퓨터공학전공|남동호|팀원|웹 백엔드 개발|![Spring](https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=spring&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white) ![Oracle DB](https://img.shields.io/badge/Oracle%20DB-F80000?style=flat-square&logo=oracle&logoColor=white)|
|컴퓨터공학전공|김준섭|팀원|버스번호판 인식|![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white) ![YOLO v5](https://img.shields.io/badge/YOLO%20v5-000000?style=flat-square)|
|컴퓨터공학전공|정채우|팀원|버스 번호 추출|![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![VOLO OCR](https://img.shields.io/badge/VOLO%20OCR-000000?style=flat-square)|

</br>

# UI/UX 설계
<h3>다음 자료를 참고하여 설계</h3>
<ul>
  <li>시각장애인 애플리케이션 콘텐츠 지침</li>
  <li>중앙대학교 시각장애인을 위한 앱 디자인 논문</li>
  <li>구글 Talkback 기본 동작 가이드 (안드로이드OS 시각장애인 설정)</li>
</ul>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/6eecc19e-de1c-4e61-8efd-743375b4e631" width="700">
</br>
</br>

# 데모 시연
<h3>시나리오</h3>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/d4d31eae-a14e-4562-87a8-06db2676921c" width="700"> 
<h3>영상</h3>
<h4>※ 음성입력/안내가 있는 웹 사이트 이므로 원본영상을 시청하는 것을 추천합니다 ※</h4>
<p>(링크 : https://youtu.be/ELm7Vdc6aMQ)</p>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/1bcfbb03-6e47-417b-a1db-13085fe2333d" width="700">
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/df30918f-cb31-4f31-b4bc-54d13333d5b2" width="700">
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/023313ab-a036-4299-8221-99c27052566a" width="700">
</br>
</br>

# 사이트 링크
<h3>https://blindroute.vercel.app</h3>
<h4>(모바일 환경에 맞게 구현, 시각장애인 설정 구글 talkback과 호환)</h4>
</br>
</br>

# API 명세서
<h3>서울시 BIS API를 기반으로 제작</h3>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/e5198f37-3ef3-470a-b5ab-b4400e84edff" width="700"> 
</br>
</br>

# 상장
<h4>왼쪽 : 2023 동국대학교 겨울 ICIP & 캡스톤디자인</h4>
<h4>오른쪽 : 2023 서울 지역사회공헌 캡스톤디자인 Fair (상장은 2024년 2월 말에 지급)</h4>
<img src="https://github.com/Dice15/BlindRoute/assets/102275981/7871f447-0b2e-4cca-a17b-182464ac317f" width="700">
</br>
</br>

# 소스코드 바로가기
- 사용자 웹 페이지 : [userpage](src/app/passenger)
- API 및 Auth 구현 : [apiroutes](src/pages/api)
- 미들 웨어 구현 : [middleware](src/middleware.ts)
</br>
</br>
