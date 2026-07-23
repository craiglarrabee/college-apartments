// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {AddUser} from "../../../lib/db/users/user";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case "POST":
                await AddUser(req.body.username, req.body.password);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        console.error(`${new Date().toISOString()} - Error in /api/users:`, e);
        res.status(400).json({error: e.code, description: e.message});
    }
}
