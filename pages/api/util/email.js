import nodemailer from "nodemailer";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";

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

export const email = withIronSessionApiRoute(async (req, res) => {
    if (!req.session.user.admin && req.body.address !== req.session.user.email) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "POST":
                let transporter = req.body.from.startsWith("suu") ? suuTransporter : snowTransporter;
                let info = await transporter.sendMail({
                    from: req.body.from,
                    to: req.body.address,
                    bcc: "suu_snow@yahoo.com",
                    subject: req.body.subject,
                    html: req.body.body
                })
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

export default email;
