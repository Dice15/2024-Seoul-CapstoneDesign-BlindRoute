import MongoDbProvider from "@/core/modules/database/MongoDbProvider";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import Google from "next-auth/providers/google";


// JWT 내부에 사용자 정보를 포함하기 위한 타입 확장
declare module "next-auth/jwt" {
    interface JWT {
        user: User;
    }
}


export const authOptions: AuthOptions = {
    // 인증 공급자를 설정합니다.
    providers: [
        CredentialsProvider({
            name: 'Guest User',
            credentials: {},
            authorize: async () => {
                return {
                    id: 'guest',
                    name: 'Guest User',
                    email: 'guest@guest.com',
                };
            },
        }),
        GithubProvider({
            clientId: process.env.BLINDROUTE_GITHUB_LOCAL_ID,
            clientSecret: process.env.BLINDROUTE_GITHUB_LOCAL_SECRET,
        }),
        Google({
            clientId: process.env.BLINDROUTE_GOOGLE_LOCAL_ID,
            clientSecret: process.env.BLINDROUTE_GOOGLE_LOCAL_SECRET,
        }),
    ],

    // 세션 설정: JWT 방식을 사용하며, 세션의 최대 유지 기간을 30일로 설정합니다.
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60 // 30일
    },

    // 콜백 함수를 정의합니다.
    callbacks: {
        // JWT 토큰 생성 시 호출됩니다.
        // 사용자 정보를 JWT 토큰에 포함시키는 로직을 정의합니다.
        jwt: async ({ token, user }: { token: JWT, user?: User }) => {
            if (user) {
                token.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
            return token;
        },

        // 세션 조회 시 호출됩니다.
        // JWT 토큰의 사용자 정보를 세션에 포함시키는 로직을 정의합니다.
        session: async ({ session, token }: { session: Session, token: JWT }) => {
            session.user = token.user;
            return session;
        },
    },

    // 비밀 키: JWT 토큰을 서명하거나 검증할 때 사용됩니다.
    secret: process.env.BLINDROUTE_NEXTAUTH_SECRET,

    // 데이터베이스 어댑터: MongoDB를 사용하도록 설정합니다.
    adapter: MongoDBAdapter(MongoDbProvider.connectDb(process.env.BLINDROUTE_MONGODB_URI)),
}

// NextAuth 설정을 export합니다.
export default NextAuth(authOptions);