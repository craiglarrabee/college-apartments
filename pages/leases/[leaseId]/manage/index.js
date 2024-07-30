import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React, {useState} from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import classNames from "classnames";
import {Alert, Tab, Tabs} from "react-bootstrap";
import {SignedLeaseList, WelcomedApplicationList} from "../../../../components/applicationList";
import {GetUserLeases} from "../../../../lib/db/users/userLease";
import {WelcomeEmailBody} from "../../../../components/welcomeEmailBody";
import ReactDomServer from "react-dom/server";
import {GetDynamicContent} from "../../../../lib/db/content/dynamicContent";
import Router from "next/router";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;
const util = require("util");
const sleep = util.promisify(setTimeout);


const Lease = ({site, page, links, user, leaseId, leases, welcome_header, welcome_body, company, ...restOfProps}) => {
    const [pendingLeases, setPendingLeases] = useState(leases.filter(lease => !lease.signed_date));
    const [signedLeases, setSignedLeases] = useState(leases.filter(lease => lease.signed_date));
    const [error, setError] = useState();
    const [success, setSuccess] = useState();
    const from = `${site}@uca.snowcollegeapartments.com`;


    const deleteLease = async (userId, site, leaseId) => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"}
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}&roomTypeId=${room_type_id}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    // now remove from the applications on this page components
                    setPendingLeases(pendingLeases.filter(app => app.user_id !== userId));
                    setSignedLeases(signedLeases.filter(app => app.user_id !== userId));
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };

    const welcome = async (data, event) => {
        event.preventDefault();

        const thisLease = leases.find(lease => lease.user_id == data.userId);
        delete data.signed_date;
        delete data.signature;

        const emailBody = <WelcomeEmailBody tenant={thisLease} leaseId={leaseId} header={welcome_header}
                                            body={welcome_body}
                                            canEdit={false} company={`${company}, LLC`}
                                            site={site} page={page}
                                            semester={thisLease.semester1}></WelcomeEmailBody>;
        const emailBodyString = ReactDomServer.renderToString(emailBody);

        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }
            const resp = await fetch(`/api/users/${data.userId}/leases/${data.leaseId}/welcome?site=${data.site}`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    delete thisLease.signed_date;
                    delete thisLease.signature;
                    thisLease.discount = data.discount;
                    setPendingLeases(leases.filter(lease => !lease.signed_date));
                    setSignedLeases(leases.filter(lease => lease.signed_date));
                    await sendWelcomeEmail(thisLease.lease_email, emailBodyString);
                    sleep(3000);
                    Router.reload();
                    break;
            }
        } catch (e) {
            console.error(e);
        }

    };

    const sendWelcomeEmail = async (emailAddress, emailBodyString) => {
        try {
            const payload = {
                from: from,
                subject: `Welcome Email from ${company}`,
                address: emailAddress,
                body: emailBodyString
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/email?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    setError("An error occurred sending the welcome email.");
                    break;
                case 204:
                    setSuccess("Welcome email sent.");
                    break;
            }
        } catch (e) {
            setError(`An error occurred sending the welcome email. ${e.message}`);
            console.error(e);
        }
    };

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        {error && <Alert dismissible variant="danger" onClose={() => setError(null)}>{error}</Alert>}
                        {success &&
                            <Alert dismissible variant="success" onClose={() => setSuccess(null)}>{success}</Alert>}
                        <Tabs defaultActiveKey={1}>
                            <Tab eventKey={1} title="Welcomed">
                                <WelcomedApplicationList data={pendingLeases} page={page} site={site} leaseId={leaseId}
                                                         handleDelete={deleteLease} handleWelcome={welcome}/>
                            </Tab>
                            <Tab eventKey={2} title="Signed">
                                <SignedLeaseList data={signedLeases} page={page} site={site} leaseId={leaseId}
                                                 handleWelcome={welcome} handleDelete={deleteLease}/>
                            </Tab>
                        </Tabs>
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
    const user = context.req.session.user;
    const page = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "");
    const site = context.query.site || SITE;
    const welcomePage = "welcome";
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    if (!user?.manage?.includes(site)) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const editing = !!user && !!user.editSite;
    const [welcomeContentRows, nav, leases] = await Promise.all([
        GetDynamicContent(site, welcomePage),
        GetNavLinks(user, site),
        GetUserLeases(context.query.leaseId)
    ]);
    let welcomeContent = {};
    welcomeContentRows.forEach(row => welcomeContent[`welcome_${row.name}`] = row.content);

    return {
        props: {
            site: site,
            page: page,
            links: nav,
            ...welcomeContent,
            canEdit: editing,
            user: {...user},
            leases: [...leases],
            leaseId: context.query.leaseId,
            company: company
        }
    };
}, ironOptions);

export default Lease;
