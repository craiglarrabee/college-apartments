// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {GetUser, DeleteUser} from "../../../../lib/db/users/user";

export default async function handler(req, res) {
    try {
        switch (req.method) {
            case "GET":
                res.status(200);
                res.json(await GetUser(req.query.userId));
                return;
            case "DELETE":
                if (!req.query.userId) {
                    res.status(400).send("Missing userId");
                    return;
                }
                await DeleteUser(req.query.userId);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        console.error(`${new Date().toISOString()} - Error in /api/users/${req.query.userId}:`, e);
        res.status(400).json({error: e.code, description: e.message});
    }
}
