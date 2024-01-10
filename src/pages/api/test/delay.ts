import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    switch (request.method) {
        case "GET": {
            setTimeout(() => {
                response.status(200).json({ data: [], message: "SUCCESS" });
            }, 1500);
            break;
        }
        default: {
            response.status(400).json({ data: [], message: "FAIL" });
        }
    };
}