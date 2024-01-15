// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {RemoveApartmentNumbers} from "../../../../lib/db/users/tenant";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.manageApartment) {
        res.status(403).send();
        return;
    }
    try {
        switch (req.method) {
            case "DELETE":
                const leaseId = req.query.leaseId;
                await RemoveApartmentNumbers(leaseId);
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
