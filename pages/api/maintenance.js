import nodemailer from "nodemailer";
import {withIronSessionApiRoute} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {AddMaintenanceRequest, GetOpenMaintenanceRequests} from "../../lib/db/users/maintenance";
import {getEstimatedSemesters} from "../../lib/util";

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

const snowMaintTransporter = nodemailer.createTransport({
    host: "uca.snowcollegeapartments.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SNOW_MAINT_EMAIL_USER,
        pass: process.env.SNOW_MAINT_EMAIL_PASS
    }
});

const handler = withIronSessionApiRoute(async (req, res) => {
    if (!req.session?.user?.isLoggedIn) {
        res.status(403).send();
        return;
    }

    try {
        switch (req.method) {
            case "GET": {
                const user = req.session?.user;
                const site = req.query.site || process.env.SITE || "suu";
                const semester = req.query.semester;
                if (!user?.isLoggedIn || !user?.admin?.includes(site) || !user?.manageApartment) {
                    res.status(403).send();
                    return;
                }
                const rows = await GetOpenMaintenanceRequests(site, semester);
                res.status(200).json(rows);
                return;
            }
            case "POST": {
                const {tenant_first_name, tenant_last_name, username, email, apartment_number, room, request, user_id, semester} = req.body || {};
                if (!apartment_number || !room || !request) {
                    res.status(400).json({error: "validation_error", description: "Missing required fields."});
                    return;
                }

                const site = req.query.site || process.env.SITE || "suu";
                const transporter = site === "suu" ? suuTransporter : snowMaintTransporter;
                const from = site === "suu" ? process.env.SUU_EMAIL_USER : process.env.SNOW_MAINT_EMAIL_USER;

                const firstName = tenant_first_name || req.session.user?.first_name || "";
                const lastName = tenant_last_name || req.session.user?.last_name || "";
                const uname = username || req.session.user?.username || "";
                const emailAddr = email || req.session.user?.email || "";
                const fullName = `${firstName} ${lastName}`.trim();
                const selectedSemester = semester || getEstimatedSemesters()[0];

                // Persist to DB first
                try {
                    await AddMaintenanceRequest(site, {
                        user_id: req.session.user?.id || user_id || null,
                        tenant_first_name: firstName,
                        tenant_last_name: lastName,
                        username: uname,
                        email: emailAddr,
                        apartment_number,
                        room,
                        request,
                        semester: selectedSemester
                    });
                } catch (dbErr) {
                    // Continue to attempt email but still report error if both fail
                    console.error(`${new Date().toISOString()} -`, dbErr);
                }

                const html = `
                    <div>
                        <p>A new maintenance request has been submitted.</p>
                        <p><strong>Name:</strong> ${fullName || uname}</p>
                        <p><strong>Username:</strong> ${uname}</p>
                        <p><strong>Email:</strong> ${emailAddr}</p>
                        <p><strong>Apartment:</strong> ${apartment_number}</p>
                        <p><strong>Room:</strong> ${room}</p>
                        <p><strong>Request:</strong><br/>${(request + "").replace(/\n/g, "<br/>")}</p>
                    </div>
                `;

                await transporter.sendMail({
                    from,
                    // to: "h2oskier1968@gmail.com",
                    to: "shaneen@utahcollegeapartments.com",
                    cc: "parkplace@utahcollegeapartments.com",
                    subject: `Maintenance Request - ${fullName || uname} - ${apartment_number} - ${room}`,
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
        console.error(`${new Date().toISOString()} -`, e);
        res.status(400).json({error: e.code, description: e.message});
    }
}, ironOptions);

export default handler;
