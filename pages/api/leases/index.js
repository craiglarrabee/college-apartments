// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {AddLease} from "../../../lib/db/content/lease";
import {AddNavLink} from "../../../lib/db/content/navLinks";
import {CopyDynamicContent} from "../../../lib/db/content/dynamicContent";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case "POST":
                let leaseId = await AddLease(req.body);
                req.body.leaseId = leaseId;
                let newPage = `leases/${leaseId}`;
                await Promise.all([AddNavLink(req.body), CopyDynamicContent(req.body.site, req.body.template, newPage)]);
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
        console.log(e);
    }
}
