// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetUser} from "../../../../lib/db/users/user";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case "GET":
                res.json(await GetUser(req.query.userId));
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
}
