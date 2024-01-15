import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";

const view = withIronSessionApiRoute(async (req, res) => {
            try {
                switch (req.method) {
                    case "POST":
                        req.session.user.manageApartment = false;
                        req.session.user.editSite = false;

                        await req.session.save();
                        res.status(204).send();
                        return;
                    default:
                        res.status(405).send();
                        return;
                }
            } catch
                (e) {
                console.error(e);
            }
        }
        ,
        ironOptions
    )
;

export default view;