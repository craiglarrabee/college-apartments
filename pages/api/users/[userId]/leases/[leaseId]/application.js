// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {
    AddApplication,
    GetApplication,
    ProcessApplication
} from "../../../../../../lib/db/users/applicationInfo";
import {AddUserLease, DeleteUserLease} from "../../../../../../lib/db/users/userLease";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                await AddApplication(req.body.site, req.query.userId, req.query.leaseId, req.body);
                res.status(204).send();
                return;
            case "PUT":
                await ProcessApplication(req.body.site, req.query.userId, req.query.leaseId, req.body);
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
