// stationNm에서 
// 1) 대문자 한 개가 있고 앞뒤로 알파벳이 없는 경우
// 2) 어떤 영문 단어가 오로지 대문자로만 이루어진 경우
// 인 부분인 경우 공백 넣음
export function stationSpeakHelper(stationNm: string) {
    return stationNm
        .replace(/\b([A-Z])\b/g, '$1 ')
        .replace(/\b([A-Z]+)\b/g, (match) => match.split('').join(' ') + ' ');
}