import nodemailer from "nodemailer";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";

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

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.isLoggedIn) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "POST": {
                const {name, apartment_number, room, request} = req.body || {};
                if (!name || !apartment_number || !room || !request) {
                    res.body = {error: "validation_error", description: "Missing required fields."};
                    res.status(400).send();
                    return;
                }

                const site = req.query.site || process.env.SITE || "suu";
                const transporter = site === "suu" ? suuTransporter : snowTransporter;
                const from = site === "suu" ? process.env.SUU_EMAIL_USER : process.env.SNOW_EMAIL_USER;

                const html = `
                    <div>
                        <p>A new maintenance request has been submitted.</p>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Apartment:</strong> ${apartment_number}</p>
                        <p><strong>Room:</strong> ${room}</p>
                        <p><strong>Request:</strong><br/>${(request + "").replace(/\n/g, "<br/>")}</p>
                    </div>
                `;

                await transporter.sendMail({
                    from,
                    to: "shaneen@utachcollegeapartments.com",
                    // to: "h2oskier1968@gmail.com",
                    subject: `Maintenance Request - ${name} - ${apartment_number} - ${room}`,
                    html
                });

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
