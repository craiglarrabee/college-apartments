// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {AddLease} from "../../../lib/db/users/lease";
import {AddNavLink} from "../../../lib/db/content/navLinks";
import {CopyDynamicContent} from "../../../lib/db/content/dynamicContent";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {AddLeaseRooms, CopyLeaseRooms} from "../../../lib/db/users/roomType";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin.includes(req.query.site)) {
        res.status(403).send();
        return;
    }
    try {
        switch (req.method) {
            case "POST":
                const leaseId = await AddLease(req.body);
                req.body.leaseId = leaseId;
                const newPage = `leases/${leaseId}`;
                let oldLeaseId;
                if (req.body.template) oldLeaseId = req.body.template.substring(req.body.template.indexOf("/") + 1);
                await Promise.all([AddNavLink(req.body), CopyDynamicContent(req.body.site, req.body.template, newPage), oldLeaseId ? CopyLeaseRooms(oldLeaseId, leaseId) : AddLeaseRooms(req.body.site, leaseId)]);
                res.json({id: leaseId});
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
