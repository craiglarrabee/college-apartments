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
import {
    AssignedApplicationList,
    DepositReceivedApplicationList,
    ProcessedApplicationList,
    UnprocessedApplicationList,
    WelcomedApplicationList
} from "../../../../components/applicationList";
import {GetApplications} from "../../../../lib/db/users/application";
import {WelcomeEmailBody} from "../../../../components/welcomeEmailBody";
import ReactDomServer from "react-dom/server";
import {GetDynamicContent} from "../../../../lib/db/content/dynamicContent";
import Router from "next/router";
import {isBot} from "../../../../lib/bots";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;
const util = require("util");
const sleep = util.promisify(setTimeout);

let resetHooks = {};

const addResetHook = (userId, hook) => {
    resetHooks[userId] = hook;
}

const Applications = ({
                          leaseId,
                          site, isABot,
                          page,
                          links,
                          user,
                          applications,
                          welcome_header,
                          welcome_body,
                          response_body,
                          company,
                          ...restOfProps
                      }) => {
    const [allApplications, setAllApplications] = useState(applications);
    const [unprocessedApplications, setUnprocessedApplications] = useState(allApplications.filter(app => app.processed === 0));
    const [processedApplications, setProcessedApplications] = useState(allApplications.filter(app => app.processed === 1 && !app.deposit_date));
    const [depositReceivedApplications, setDepositReceivedApplications] = useState(allApplications.filter(app => app.deposit_date && !app.apartment_number));
    const [assignedApplications, setAssignedApplications] = useState(allApplications.filter(app => app.apartment_number && !app.welcome_date));
    const [welcomedApplications, setWelcomedApplications] = useState(allApplications.filter(app => app.welcome_date));
    const [error, setError] = useState();
    const [success, setSuccess] = useState();
    const from = `${site}@uca.snowcollegeapartments.com`;

    const sendResponseEmail = async (emailAddress) => {
        try {
            const payload = {
                from: from,
                subject: `Welcome to ${company}`,
                address: emailAddress,
                body: response_body
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/email?site=${site}`, options);
            switch (resp.status) {
                case 204:
                case 200:
                    setSuccess(`Application response email sent.`);
                    break;
                case 400:
                default:
                    setError("An error occurred sending the application response email.");
                    console.error(new Date().toISOString() + " - " +`Error occurred sending response email to ${emailAddress}`);
                    break;
            }
        } catch (e) {
            setError(`An error occurred sending the application response email. ${e.message}`);
            console.error(new Date().toISOString() + " - " +`Error occurred sending response email to ${emailAddress}`);
            console.error(new Date().toISOString() + " - " +e);
        }
    };

    const getEmailBodyString = (thisLease) => {
        const emailBody = <WelcomeEmailBody tenant={thisLease} leaseId={leaseId} header={welcome_header}
                                            body={welcome_body}
                                            canEdit={false} company={`${company}, LLC`}
                                            site={site} page={page}
                                            semester={thisLease.semester1}></WelcomeEmailBody>;
        const emailBodyString = ReactDomServer.renderToString(emailBody);
        return emailBodyString;
    };

    const sendWelcomeToAdmin = async (userId) => {
        const thisApp = allApplications.find(app => app.user_id == userId);
        const emailBodyString = getEmailBodyString(thisApp);

        await sendWelcomeEmail(user.email, emailBodyString);
        await sleep(3000);
        Router.reload();
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
                case 204:
                case 200:
                    setSuccess(`Welcome email sent to ${emailAddress}`);
                    break;
                case 400:
                default:
                    setError("An error occurred sending the welcome email.");
                    console.error(new Date().toISOString() + " - " +`Error occurred sending welcome email to ${emailAddress}`);
                    break;
            }
        } catch (e) {
            setError(`An error occurred sending the welcome email. ${e.message}`);
            console.error(new Date().toISOString() + " - " +`Error occurred sending welcome email to ${emailAddress}`);
            console.error(new Date().toISOString() + " - " +e);
        }
    }

    const processApplication = async (userId, site, leaseId, processed) => {
        const thisApp = allApplications.find(app => app.user_id == userId);
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({processed: processed}),
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}`, options)
            switch (resp.status) {
                case 204:
                    // now remove from the applications on this page components
                    const newApplications = await Promise.all(allApplications.map(async (app) => {
                        if (app.user_id === userId) {
                            app.processed = processed ? 1 : 0;
                            return app
                        } else {
                            return app
                        }
                    }));
                    setAllApplications(newApplications);
                    setUnprocessedApplications(newApplications.filter(app => app.processed === 0));
                    setProcessedApplications(newApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(newApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number && !app.lease_date));
                    if (processed) await sendResponseEmail(thisApp.email)
                    break;
                case 400:
                default:
                    setError("An error occurred modifying the application.");
                    break;
            }
        } catch (e) {
            setError("An error occurred modifying the application.");
            console.error(new Date().toISOString() + " - " +e);
        }
    };

    const deleteApplication = async (userId, site, leaseId, roomTypeId) => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"}
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}&roomTypeId=${roomTypeId}`, options)
            switch (resp.status) {
                case 204:
                case 200:
                    console.log(new Date().toISOString() + " - " +`Application and lease were deleted for user: ${userId} and lease: ${leaseId} in manageApplications.deleteApplication.`);
                    // now remove from the applications on this page components
                    const newApplications = allApplications.filter(app => !(app.user_id == userId && app.pending_application == leaseId && app.room_type_id == roomTypeId));
                    setAllApplications(newApplications);
                    setUnprocessedApplications(newApplications.filter(app => app.processed === 0));
                    setProcessedApplications(newApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(newApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number && !app.welcome_date));
                    setWelcomedApplications(newApplications.filter(app => app.welcome_date));
                    break;
                case 400:
                default:
                    break;
            }
        } catch (e) {
            console.error(new Date().toISOString() + " - " +e);
        }
    };


    const receiveDeposit = async (userId, site, leaseId) => {
        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
            }

            let resp = await fetch(`/api/users/${userId}/leases/${leaseId}?site=${site}`, options);
            switch (resp.status) {
                case 200:
                case 204:
                    resp = await fetch(`/api/users/${userId}/leases/${leaseId}/deposit?site=${site}`, options);
                    if (resp.status !== 200) {
                        setError("An error occurred modifying the application. Please try again.");
                        console.error(new Date().toISOString() + " - " +`An API 400 error occurred modifying the application for user: ${userId} and lease: ${leaseId}`);
                        break;
                    }
                    // now remove from the applications on this page components
                    const updatedApplication = await resp.json();
                    const newApplications = await Promise.all(allApplications.map(async (app) => {
                        if (app.user_id === userId) {
                            return updatedApplication
                        } else {
                            return app
                        }
                    }));
                    setAllApplications(newApplications);
                    setUnprocessedApplications(newApplications.filter(app => app.processed === 0));
                    setProcessedApplications(newApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(newApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number && !app.lease_date));
                    break;
                case 400:
                default:
                    setError("An error occurred creating the lease. Please try again.");
                    console.error(new Date().toISOString() + " - " +`An API 400 error occurred creating lease for user: ${userId} and lease: ${leaseId}`);
                    break;
            }
        } catch (e) {
            setError("An error occurred creating the lease. Please try again.");
            console.error(new Date().toISOString() + " - " +e);
            console.error(new Date().toISOString() + " - " +`An error occurred creating lease for user: ${userId} and lease: ${leaseId}`);
        }
    };

    const welcome = async (data, event) => {
        event.preventDefault();

        const thisApp = allApplications.find(app => app.user_id == data.userId);
        const emailBodyString = getEmailBodyString(thisApp);

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
                    const newApplications = allApplications.map((app) => {
                        if (app.user_id == data.userId) {
                            return {...app, welcome_date: new Date().toLocaleDateString()};
                        } else {
                            return app
                        }
                    });
                    setAllApplications(newApplications);
                    setUnprocessedApplications(newApplications.filter(app => app.processed === 0));
                    setProcessedApplications(newApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(newApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number && !app.welcome_date));
                    setWelcomedApplications(newApplications.filter(app => app.welcome_date));
                    delete resetHooks[data.userId];
                    Object.values(resetHooks).forEach(hook => hook());
                    await sendWelcomeEmail(thisApp.email, emailBodyString);
                    break;
            }
        } catch (e) {
            console.error(new Date().toISOString() + " - " +e);
        }

    };

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        {error && <Alert dismissible variant="danger" onClose={() => setError(null)}>{error}</Alert>}
                        {success &&
                            <Alert dismissible variant="success" onClose={() => setSuccess(null)}>{success}</Alert>}
                        <Tabs defaultActiveKey={1}>
                            <Tab eventKey={1} title={`Unprocessed (${unprocessedApplications.length})`}>
                                <UnprocessedApplicationList data={unprocessedApplications} page={page} site={site}
                                                            leaseId={leaseId} handleDelete={deleteApplication}
                                                            handleProcess={processApplication}/>
                            </Tab>
                            <Tab eventKey={2} title={`Processed (${processedApplications.length})`}>
                                <ProcessedApplicationList data={processedApplications} page={page} site={site}
                                                          leaseId={leaseId} handleDelete={deleteApplication}
                                                          handleDeposit={receiveDeposit}
                                                          handleProcess={processApplication}/>
                            </Tab>
                            <Tab eventKey={3} title={`Deposit Received (${depositReceivedApplications.length})`}>
                                <DepositReceivedApplicationList data={depositReceivedApplications} page={page}
                                                                leaseId={leaseId} site={site}/>
                            </Tab>
                            <Tab eventKey={4} title={`Assignment Made (${assignedApplications.length})`}>
                                <AssignedApplicationList data={assignedApplications} page={page} leaseId={leaseId}
                                                         site={site} handleWelcome={welcome} addResetHook={addResetHook}
                                                         company={company}/>
                            </Tab>
                            <Tab eventKey={5} title={`Welcomed (${welcomedApplications.length})`}>
                                <WelcomedApplicationList data={welcomedApplications} page={page} leaseId={leaseId}
                                                         site={site} company={company}
                                                         handleDelete={deleteApplication} handleWelcome={welcome} /*handleWelcomeAdmin={sendWelcomeToAdmin}*//>
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
    const [welcomeContentRows, nav, applications, responseEmailContentRows] = await Promise.all([
        GetDynamicContent(site, welcomePage),
        GetNavLinks(user, site),
        GetApplications(site, context.query.leaseId),
        GetDynamicContent(site, "response"),
    ]);
    let welcomeContent = {};
    const responseEmailContent = [];
    welcomeContentRows.forEach(row => welcomeContent[`welcome_${row.name}`] = row.content);
    responseEmailContentRows.forEach(row => responseEmailContent[`response_${row.name}`] = row.content);

    return {
        props: {
            leaseId: context.query.leaseId,
            site: site,
            page: page,
            links: nav,
            isABot: isBot(context),
            ...welcomeContent,
            ...responseEmailContent,
            canEdit: editing,
            user: {...user},
            applications: [...applications],
            company: company
        }
    };
}, ironOptions);

export default Applications;
