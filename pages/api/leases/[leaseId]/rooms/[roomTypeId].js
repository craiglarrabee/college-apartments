// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetLeaseRooms, UpdateLeaseRoom} from "../../../../../lib/db/users/roomType";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../lib/session/options";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetLeaseRooms(req.query.leaseId);
                res.status(200).send();
            case "PUT":
                if (!req.session.user.admin.includes(req.query.site)) {
                    res.status(403).send();
                    return;
                }
                await UpdateLeaseRoom(req.query.leaseId, req.query.roomTypeId, req.body);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(new Date().toISOString() + " - " +e);
    }
}, ironOptions);

export default handler;
