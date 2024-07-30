// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {AddUserLease, DeleteUserLease, GetUserLease, UpdateUserLease} from "../../../../../../lib/db/users/userLease";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetUserLease(req.query.userId, req.query.leaseId);
                res.status(200).send();
                return;
            case "DELETE":
                res.body = await DeleteUserLease(req.query.userId, req.query.leaseId, req.query.roomTypeId);
                res.status(200).send();
                return;
            case "POST":
                await AddUserLease(req.query.userId, req.query.leaseId, req.body);
                res.status(204).send();
                return;
            case "PUT":
                await UpdateUserLease(req.query.userId, req.query.leaseId, req.body);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(e);
    }
}, ironOptions);

export default handler;
