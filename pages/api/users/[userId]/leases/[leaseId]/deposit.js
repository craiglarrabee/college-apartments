// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../../lib/session/options";
import {DeleteDeposit, ReceiveDeposit} from "../../../../../../lib/db/users/application";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.manageApartment) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                const postResp = await ReceiveDeposit(req.query.site, req.query.userId, req.query.leaseId);
                res.json({...postResp});
                res.status(200).send();
                return;
            case "DELETE":
                const delResp = await DeleteDeposit(req.query.site, req.query.userId, req.query.leaseId);
                res.json({...delResp});
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
