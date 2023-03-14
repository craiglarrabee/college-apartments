// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../lib/session/options";
import {AddTenantInfo, GetTenantInfo} from "../../../../../lib/db/users/tenantInfo";
import {AddLeaseInfo, GetLeaseInfo} from "../../../../../lib/db/users/leaseInfo";

const handler = withIronSessionApiRoute(async (req, res) => {
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetLeaseInfo(req.query.id, req.query.leaseDefinition);
                res.status(200).send();
            case "POST":
                await AddLeaseInfo(req.query.id, req.query.leaseDefinition, req.body);
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
