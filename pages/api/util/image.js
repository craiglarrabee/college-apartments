import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import fs from "fs";
import {DeleteDynamicContent} from "../../../lib/db/content/dynamicContent";


const image = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin.includes(req.query.site)) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "POST":
                const img = req.body.replace(/^data:image\/\w+;base64,/, "");
                fs.writeFileSync(`./upload/images/${req.query.site}/${req.query.page}/${req.query.fileName}`, img, {encoding: "base64"});
                res.status(204).send();
                return;
            case "DELETE":
                fs.rmSync(`./upload/images/${req.query.site}/${req.query.page}/${req.query.fileName}`);
                DeleteDynamicContent(req.query.site, req.query.page, req.query.fileName);
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(new Date().toISOString() + " - " +e);
    }
}, ironOptions);

export default image;