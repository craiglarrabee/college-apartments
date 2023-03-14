// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetDynamicContent, UpdateDynamicContent} from "../../../../../lib/db/content/dynamicContent";

export default async function handler(req, res) {
    const dbPage = `leases/${req.query.page}`;
    try {
        switch (req.method) {
            case "PUT":
                await UpdateDynamicContent(req.query.site, dbPage, req.body);
                res.status(204).send();
                return;
            case "GET":
                const [rows] = await GetDynamicContent(req.query.site, dbPage);
                res.body = {...rows};
                res.status(200).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        console.log(e);
    }
}
