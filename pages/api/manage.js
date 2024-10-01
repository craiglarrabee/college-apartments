import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";

const manage = withIronSessionApiRoute(async (req, res) => {
    // get user from database
    try {
        switch (req.method) {
            case "POST":
                if (req.session?.user?.manage.includes(req.query.site)) {
                    req.session.user.manageApartment = true;
                    req.session.user.editSite = false;
                } else if (req.session?.user) {
                    req.session.user.manageApartment = false;
                    req.session.user.editSite = false;
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

export default manage;