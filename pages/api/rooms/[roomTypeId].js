// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetLeaseRooms, GetRoomType, UpdateLeaseRoom, UpdateRoomType} from "../../../lib/db/users/roomType";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetRoomType(req.query.roomTypeId);
                res.status(200).send();
            case "PUT":
                if (!req.session.user.admin) {
                    res.status(403).send();
                    return;
                }
                await UpdateRoomType(req.query.roomTypeId, req.body);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.log(e);
    }
}, ironOptions);

export default handler;
