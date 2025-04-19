import nodemailer from "nodemailer";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {hashStringAndCode} from "../../../lib/util";

const suuTransporter = nodemailer.createTransport({
    host: "uca.snowcollegeapartments.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SUU_EMAIL_USER,
        pass: process.env.SUU_EMAIL_PASS
    }
});

const snowTransporter = nodemailer.createTransport({
    host: "uca.snowcollegeapartments.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SNOW_EMAIL_USER,
        pass: process.env.SNOW_EMAIL_PASS
    }
});

const verify = withIronSessionApiRoute(async (req, res) => {
    if (req.headers["user-agent"].toLowerCase().includes("bot") && req.headers["user-agent"] !== "Cubot") {
        res.status(403).send({});
    }

    const code = hashStringAndCode(req.body.email, req.session.user.verifyCode);

    try {
        switch (req.method) {
            case "POST":
                let transporter = req.body.from.startsWith("suu") ? suuTransporter : snowTransporter;
                let info = await transporter.sendMail({
                    from: req.body.from,
                    to: req.body.email,
                    subject: req.body.subject,
                    html: req.body.body + "<b>" + code + "</b>"
                });
                res.status(204).send();
                return;
                break;
            default:
                res.status(405).send({});
                return;
        }
    } catch (e) {
        res.status(401).send({});
    }
}, ironOptions);

export default verify;