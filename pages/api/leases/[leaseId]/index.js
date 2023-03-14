// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetLease, UpdateLease} from "../../../../lib/db/content/lease";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetLease(req.query.leaseId);
                res.status(200).send();
            case "PUT":
                await UpdateLease(req.query.leaseId, req.body);
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
}
