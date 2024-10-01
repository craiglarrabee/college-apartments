import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";

const maintain = withIronSessionApiRoute(async (req, res) => {
    // get user from database
    try {
        switch (req.method) {
            case "POST":
                if (req?.session?.user?.admin?.includes(req.query.site) && req.body?.editSite) {
                    req.session.user.editSite = true;
                    req.session.user.manageApartment = false;
                } else if (req.session?.user) {
                    req.session.user.editSite = false;
                    req.session.user.manageApartment = false;
                }
                await req.session.save();
                res.status(204).send();
                return;
            default:
                res.status(405).send();
                return;
        }
    } catch (e) {
        console.error(new Date().toISOString() + " - " +e);
    }
}, ironOptions);

export default maintain;