// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {SearchTenantByName} from "../../../lib/db/users/tenant";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.manage.includes(req.query.site)) res.status(403).send();
    try {
        switch (req.method) {
            case "GET":
                const tenants = await SearchTenantByName(req.query.site, req.query.search);
                res.json({tenants: tenants});
                if (!tenants || tenants.length === 0) {
                    res.status(404).send();
                    return;
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
        console.log(e);
    }
}, ironOptions);

export default handler;
