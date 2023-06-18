import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import fs from "fs";


const image = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "POST":
                const img = req.body.replace(/^data:image\/\w+;base64,/, "");
                fs.writeFileSync(`./public/images/${req.query.site}/${req.query.page}/${req.query.fileName}`, img, {encoding: "base64"});
                res.status(204).send();
                return;
            case "DELETE":
                fs.rmSync(`./public/images/${req.query.site}/${req.query.page}/${req.query.fileName}`);
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
}, ironOptions);

export default image;