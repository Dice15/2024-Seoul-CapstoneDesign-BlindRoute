import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';


/**
 * Next.js 애플리케이션에 대한 미들웨어 로직입니다.
 * 
 * 요청된 경로에 따라 적절한 처리를 수행합니다.
 * 정적 파일이나 내부 요청, API 요청에 대해서는 다음 단계로 진행하고,
 * 로그인이 필요한 페이지에 대해서는 인증 여부를 확인합니다.
 * 또한, 사용자의 디바이스 타입과 페이지 타입이 일치하지 않으면 리다이렉트합니다.
 * 
 * @param {NextRequest} request - Next.js의 요청 객체입니다.
 * @returns {NextResponse} 처리 결과에 따른 응답 객체를 반환합니다.
 */
export async function middleware(request: NextRequest) {
    // 정적 파일이나 내부 요청인 경우
    if (isInternalOrStaticRequest(request)) {
        return NextResponse.next();
    }

    // 로그인이 필요한 페이지인 경우 인증 확인
    if (isRequireAuthentication(request)) {
        if (!(await isUserAuthenticated(request))) {
            return NextResponse.redirect(new URL(getHostUrl(request)));
        }
    }

    // API 요청, 페이지 요청 구분 경우
    if (isAPIRequest(request)) {
    }
    else {
    }

    // 특정 경로에 대한 처리
    switch (request.nextUrl.pathname) {
        default: {
            return NextResponse.next();
        }
    }
}




/**
 * 주어진 요청이 Next.js의 정적 파일이나 내부 요청인지 판단합니다.
 * 
 * '/_next/'로 시작하는 경로와 '/favicon.ico' 경로는
 * Next.js의 정적 파일 또는 내부 요청으로 간주됩니다.
 * 이러한 경로에 대한 요청인 경우 true를 반환합니다.
 *
 * @param {NextRequest} request - 요청 객체입니다.
 * @returns {boolean} 정적 파일이나 내부 요청인 경우 true, 그렇지 않으면 false를 반환합니다.
 */
function isInternalOrStaticRequest(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith('/_next/')) return true;
    if (pathname.startsWith('/favicon.ico')) return true;
    return false;
}




/**
 * 주어진 요청이 API 경로에 해당하는지 여부를 판단합니다.
 *
 * '/api'로 시작하는 경로는 API 요청으로 간주됩니다.
 * 이러한 경로에 대한 요청인 경우 true를 반환합니다.
 *
 * @param {NextRequest} request - 요청 객체입니다.
 * @returns {boolean} API 요청인 경우 true, 그렇지 않으면 false를 반환합니다.
 */
function isAPIRequest(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return pathname.startsWith('/api');
}




/**
 * 주어진 경로가 로그인(계정 인증)을 필요로 하는지 판별합니다.
 *
 * @param {NextRequest} request - 요청 객체입니다.
 * @returns {boolean} 로그인이 필요한 페이지인 경우 true, 그렇지 않으면 false를 반환합니다.
 */
function isRequireAuthentication(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    if (pathname === "/") return false;
    if (pathname.startsWith("/api/auth")) return false;
    return true;
}




/**
 * 현재 요청의 호스트 URL을 구성합니다.
 *
 * @param {NextRequest} request - 요청 객체, 현재 요청의 URL 정보를 담고 있습니다.
 * @returns {string} - 현재 요청의 호스트 URL을 문자열로 반환합니다.
 */
function getHostUrl(request: NextRequest): string {
    return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}




/**
 * 주어진 요청에 대해 사용자가 인증되었는지 여부를 판별합니다.
 *
 * 이 함수는 NextAuth의 `getToken` 함수를 사용하여
 * 요청에 포함된 세션 토큰을 검증하고, 유효한 세션이 있는지 확인합니다.
 * 유효한 세션이 있으면 true를, 그렇지 않으면 false를 반환합니다.
 *
 * @param {NextRequest} request - 검사할 요청 객체입니다.
 * @returns {Promise<boolean>} 사용자가 인증되었는지 여부를 나타내는 Promise 객체입니다.
 */
async function isUserAuthenticated(request: NextRequest): Promise<boolean> {
    const session = await getToken({ req: request, secret: process.env.BLINDROUTE_NEXTAUTH_SECRET });
    return session !== null;
}