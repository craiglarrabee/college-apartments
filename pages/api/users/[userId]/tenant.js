// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {AddTenant, GetTenant, UpdateUserLeaseTenant} from "../../../../lib/db/users/tenant";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetTenant(req.query.site, req.query.userId);
                res.status(200).send();
            case "POST":
                if (req.body.leaseId) {
                    await UpdateUserLeaseTenant(req.query.userId, req.body.leaseId, req.body);
                } else {
                    await AddTenant(req.query.userId, req.body);
                }
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
