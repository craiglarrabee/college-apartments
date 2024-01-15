// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../lib/session/options";
import {AddApplication} from "../../../../../lib/db/users/application";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.isLoggedIn) res.status(403).send();
    try {
        switch (req.method) {
            case "POST":
                for (const lease of req.body.leases) {
                    const data = {...req.body, lease_id: lease.lease_id, room_type_id: lease.room_type_id}
                    await AddApplication(data.site, req.query.userId, data.lease_id, data);
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
        console.error(e);
    }
}, ironOptions);

export default handler;
