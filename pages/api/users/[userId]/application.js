// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {GetTenantPendingApplications} from "../../../../lib/db/users/application";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetTenantPendingApplications(req.query.userId);
                if (!res.body) {
                    res.status(404).send();
                }
                res.status(200).send();
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
