import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {CloseMaintenanceRequest} from "../../../lib/db/users/maintenance";

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.isLoggedIn) {
        res.status(403).send();
        return;
    }

    const site = req.query.site || process.env.SITE || "suu";
    const user = req.session.user;

    try {
        switch (req.method) {
            case "PUT": {
                if (!user?.admin?.includes(site) || !user?.manageApartment) {
                    res.status(403).send();
                    return;
                }
                const id = req.query.id;
                const {comments} = req.body || {};
                if (!id) {
                    res.status(400).json({error: "validation_error", description: "Missing id."});
                    return;
                }
                await CloseMaintenanceRequest(id, comments);
                res.status(204).send();
                return;
            }
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        res.body = {error: e.code, description: e.message};
        res.status(400).send();
        console.error(`${new Date().toISOString()} -`, e);
    }
}, ironOptions);

export default handler;
