import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * HTTP 요청에 대한 처리
 * @param {NextRequest} request - 들어오는 요청 정보
 * @returns {NextResponse} 요청에 따른 응답을 반환
 */
export async function middleware(request: NextRequest) {
    // 정적 파일이나 내부 요청이 아닌 경우 추가 처리 수행
    if (!isInternalOrStaticRequest(request)) {
        // 로그인이 필요한 페이지에 대한 인증 확인
        if (isRequireAuthentication(request)) {
            // 사용자 인증이 되지 않은 경우 로그인 페이지로 리다이렉트
            if (!(await isUserAuthenticated(request))) {
                return NextResponse.redirect(new URL(getHostUrl(request)));
            }
        }
    }
    return NextResponse.next();
}

/**
 * 요청이 정적 파일이나 내부 요청인지 판단
 * @param {NextRequest} request - 요청 객체
 * @returns {boolean} 정적 파일이나 내부 요청인 경우 true를 반환
 */
function isInternalOrStaticRequest(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico');
}

/**
 * 요청이 API 요청인지 판단
 * @param {NextRequest} request - 요청 객체
 * @returns {boolean} API 요청인 경우 true를 반환
 */
function isAPIRequest(request: NextRequest): boolean {
    return request.nextUrl.pathname.startsWith('/api');
}

/**
 * 요청된 페이지가 인증을 필요로 하는지 판별
 * @param {NextRequest} request - 요청 객체
 * @returns {boolean} 인증이 필요한 페이지인 경우 true를 반환
 */
function isRequireAuthentication(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return pathname.startsWith("/passenger") || pathname.startsWith("/buspanel");
}

/**
 * 요청의 호스트 URL을 반환합니다.
 * @param {NextRequest} request - 요청 객체입니다.
 * @returns {string} 요청의 호스트 URL을 문자열로 반환
 */
function getHostUrl(request: NextRequest): string {
    return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

/**
 * 요청에 포함된 사용자가 인증되었는지 여부를 확인
 * @param {NextRequest} request - 요청 객체
 * @returns {Promise<boolean>} 인증된 사용자인 경우 true를 반환
 */
async function isUserAuthenticated(request: NextRequest): Promise<boolean> {
    const session = await getToken({ req: request, secret: process.env.BLINDROUTE_NEXTAUTH_SECRET });
    return session !== null;
}
