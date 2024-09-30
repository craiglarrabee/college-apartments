// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetDynamicContent, UpdateDynamicContent} from "../../../../../lib/db/content/dynamicContent";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../../../lib/session/options";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.isLoggedIn) res.status(403).send();
    const dbPage = `leases/${req.query.page}`;
    try {
        switch (req.method) {
            case "PUT":
                if (!req.session.user.admin.includes(req.query.site)) {
                    res.status(404).send();
                    return;
                }
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
        console.error(new Date().toISOString() + " - " +e);
    }
}, ironOptions);

export default handler;
