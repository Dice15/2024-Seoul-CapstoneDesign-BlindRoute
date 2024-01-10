import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import MongoDbProvider from '@/core/modules/database/MongoDbProvider';


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const db = await MongoDbProvider.getDb(process.env.BLINDROUTE_MONGODB_URI);
    const session = await getServerSession(request, response, authOptions);

    switch (request.method) {
        case "POST": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", itemList: null });
                break;
            }

            try {
                const requestParam = request.body;
                const insertResult = await db.collection("boarding_reservations").insertOne({
                    owner: session.user?.email,
                    arsId: requestParam.arsId,
                    busRouteId: requestParam.busRouteId
                });

                if (insertResult.acknowledged === undefined) {
                    response.status(500).json({ msg: "DB 저장 중 오류가 발생했습니다.", itemList: null });
                } else {
                    response.status(200).json({ msg: "정상적으로 처리되었습니다.", itemList: insertResult.insertedId });
                }
            } catch (error) {
                response.status(502).json({ msg: "DB 저장 중 오류가 발생했습니다.", itemList: null });
            }
            break;
        }
        case "DELETE": {
            if (!session) {
                response.status(401).json({ msg: "Unauthorized: 세션이 없습니다.", itemList: null });
                break;
            }

            try {
                const deleteResult = await db.collection("boarding_reservations").deleteMany({
                    owner: session.user?.email,
                });

                if (deleteResult.acknowledged === undefined) {
                    response.status(500).json({ msg: "DB 삭제 중 오류가 발생했습니다.", itemList: null });
                } else {
                    response.status(200).json({ msg: "정상적으로 처리되었습니다.", itemList: deleteResult.deletedCount });
                }
            } catch (error) {
                response.status(502).json({ msg: "DB 삭제 중 오류가 발생했습니다.", itemList: null });
            }
            break;
        }
        default: {
            response.status(405).json({ msg: "지원하지 않는 메서드입니다.", itemList: null });
            break;
        }
    }
}