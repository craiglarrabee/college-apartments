import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {hashStringAndCode} from "../../../lib/util";

const login = withIronSessionApiRoute(async (req, res) => {
    if (req.headers["user-agent"].toLowerCase().includes("bot") && req.headers["user-agent"] !== "Cubot") {
        res.status(403).send({});
    }

    const code = hashStringAndCode(req.body.email, req.session.user.verifyCode);

    try {
        switch (req.method) {
            case "POST":
                if (code !== req.body.verifyCode) {
                    res.status(400).send({error: "Invalid code"});
                    return;
                }
                res.status(204).send();
                return;
                break;
            default:
                res.status(405).send({});
                return;
        }
    } catch (e) {
        res.status(400).send({});
    }
}, ironOptions);

export default login;