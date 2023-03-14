// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetLeaseDefinition, UpdateLeaseDefinition} from "../../../lib/db/content/leaseDefinition";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case "GET":
                res.body = await GetLeaseDefinition(req.query.id);
                res.status(200).send();
            case "PUT":
                await UpdateLeaseDefinition(req.query.id, req.body);
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
