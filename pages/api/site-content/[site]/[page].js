// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import ConnectionPool from "../../../../lib/db/connection";

export default async function handler(req, res) {
    const conn = await ConnectionPool();
    switch (req.method) {
        case "PUT":
            let dbResp = await conn.execute("REPLACE INTO site_content (site, page, name, content) VALUES (?,?,?,?)",
                [req.query.site, req.query.page, req.body.name, req.body.content]);
            res.status(204).send();
            return;
        case "GET":
            const [rows] = await conn.execute("SELECT name, content FROM site_content WHERE site = ? AND page = ?", [req.query.site, req.query.page])
            res.body = {...rows};
            res.status(200).send();
            return;
        default:
            res.status(405).send();
            return;
    }
}
