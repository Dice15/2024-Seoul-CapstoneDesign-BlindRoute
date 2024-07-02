import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function middleware(request: NextRequest) {
    // 정적 파일이나 내부 요청이 아닌 경우 추가 처리 수행
    if (!isInternalOrStaticRequest(request)) {
        if (!isAPIRequest(request)) {
            // 지원 기기 체크
            if (!isDeviceTypeMatchedWithPage(request)) {
                if (getDeviceType(request) === 0) {
                    return NextResponse.redirect(new URL(`${getHostUrl(request)}/desktop`));
                } else {
                    return NextResponse.redirect(new URL(`${getHostUrl(request)}`));
                }
            }

            // 인증이 필요한 웹 페이지에 사용자 인증이 되지 않은 채로 접속하는 경우, 홈페이지로 리다이렉트
            if (isRequireAuthentication(request)) {
                if (!(await isUserAuthenticated(request))) {
                    return NextResponse.redirect(new URL(getHostUrl(request)));
                }
            }
        }
    }
    return NextResponse.next();
}


function isInternalOrStaticRequest(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return pathname.startsWith('/_next/')
        || pathname.startsWith('/favicon.ico')
        || pathname.startsWith('/icons')
        || pathname.startsWith('/images')
        || pathname.startsWith('/sounds');
}


function isAPIRequest(request: NextRequest): boolean {
    return request.nextUrl.pathname.startsWith('/api');
}


function isRequireAuthentication(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return pathname.startsWith("/passenger") || pathname.startsWith("/buspanel");
}


function getHostUrl(request: NextRequest): string {
    return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}


async function isUserAuthenticated(request: NextRequest): Promise<boolean> {
    const session = await getToken({ req: request, secret: process.env.BLINDROUTE_NEXTAUTH_SECRET });
    return session !== null;
}


function getDeviceType(request: NextRequest): number {
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /mobile/i.test(userAgent);
    return Number(isMobile);
}


function isDeviceTypeMatchedWithPage(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /mobile/i.test(userAgent);
    const isMobilePage = !request.nextUrl.pathname.includes("desktop");
    return isMobile === isMobilePage;
}