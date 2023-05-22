import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React, {useEffect, useState} from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import classNames from "classnames";
import {Button, Tab, Table, Tabs} from "react-bootstrap";
import {
    AssignedApplicationList,
    DepositReceivedApplicationList,
    ProcessedApplicationList,
    UnprocessedApplicationList
} from "../../../../components/applicationList";
import {
    GetApplications
} from "../../../../lib/db/users/application";

const SITE = process.env.SITE;
let resetHooks = {};

const addResetHook = (userId, hook) => {
    resetHooks[userId] = hook;
}

const Applications = ({
                   leaseId, site, page, links, user, applications
               }) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const [allApplications, setAllApplications] = useState(applications);
    const [unprocessedApplications, setUnprocessedApplications] = useState(allApplications.filter(app => app.processed === 0));
    const [processedApplications, setProcessedApplications] = useState(allApplications.filter(app => app.processed === 1 && !app.deposit_date));
    const [depositReceivedApplications, setDepositReceivedApplications] = useState(allApplications.filter(app => app.deposit_date && !app.apartment_number));
    const [assignedApplications, setAssignedApplications] = useState(allApplications.filter(app => app.apartment_number));

    const processApplication = async (userId, site, leaseId, processed) => {
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({processed: processed}),
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    // now remove from the applications on this page components
                    const newApplications = await Promise.all(allApplications.map(async (app) => { if (app.user_id === userId) {app.processed = processed ? 1 : 0; return app} else {return app}}));
                    setAllApplications(newApplications);
                    setUnprocessedApplications(newApplications.filter(app => app.processed === 0));
                    setProcessedApplications(newApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(newApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number));
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    };

    const deleteApplication = async (userId, site, leaseId) => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"}
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    // now remove from the applications on this page components
                    setAllApplications(allApplications.filter(app => app.user_id !== userId))
                    setUnprocessedApplications(allApplications.filter(app => app.processed === 0));
                    setProcessedApplications(allApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(allApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number));
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    };


    const receiveDeposit = async (userId, site, leaseId) => {
        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/deposit?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                    // now remove from the applications on this page components
                    const updatedApplication = await resp.json();
                    const newApplications = await Promise.all(allApplications.map(async (app) => { if (app.user_id === userId) {return updatedApplication} else {return app}}));
                    setAllApplications(newApplications);
                    setUnprocessedApplications(newApplications.filter(app => app.processed === 0));
                    setProcessedApplications(newApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(newApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number));
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    };

    const welcome = async (data, event) => {
        event.preventDefault();
        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }

            const resp = await fetch(`/api/users/${data.userId}/leases/${data.leaseId}?site=${data.site}`, options);
            //TODO: send welcome email
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    // now remove from the applications on this page components
                    const newApplications = allApplications.filter(app => app.user_id != data.userId);
                    setAllApplications(newApplications);
                    setUnprocessedApplications(newApplications.filter(app => app.processed === 0));
                    setProcessedApplications(newApplications.filter(app => app.processed === 1 && !app.deposit_date));
                    setDepositReceivedApplications(newApplications.filter(app => app.deposit_date && !app.apartment_number));
                    setAssignedApplications(newApplications.filter(app => app.apartment_number));
                    delete resetHooks[data.userId];
                    Object.values(resetHooks).forEach(hook => hook());
                    break;
            }
        } catch (e) {
            console.log(e);
        }

    };

    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1} >
                        <Tab eventKey={1} title="Unprocessed">
                            <UnprocessedApplicationList data={unprocessedApplications} page={page} site={site} leaseId={leaseId} handleDelete={deleteApplication} handleProcess={processApplication} />
                        </Tab>
                        <Tab eventKey={2} title="Processed">
                            <ProcessedApplicationList data={processedApplications} page={page} site={site} leaseId={leaseId} handleDelete={deleteApplication} handleDeposit={receiveDeposit} handleProcess={processApplication}/>
                        </Tab>
                        <Tab eventKey={3} title="Deposit Received">
                            <DepositReceivedApplicationList data={depositReceivedApplications} page={page} leaseId={leaseId} site={site} />
                        </Tab>
                        <Tab eventKey={4} title="Assignment Made">
                            <AssignedApplicationList data={assignedApplications} page={page} leaseId={leaseId} site={site} handleWelcome={welcome} addResetHook={addResetHook} />
                        </Tab>
                    </Tabs>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.substring(0,context.resolvedUrl.indexOf("?")).replace(/\//, "");
    const site = context.query.site || SITE;
    if (user.admin !== site && !user.manageApartment) {
        return {notFound: true};
    }
    const editing = !!user && !!user.editSite;
    const [nav, applications] = await Promise.all([
        GetNavLinks(user, site),
        GetApplications(site, context.query.leaseId)
    ]);

    return {
        props: {
            leaseId: context.query.leaseId,
            site: site,
            page: page,
            links: nav,
            canEdit: editing,
            user: {...user},
            applications: [...applications],
        }
    };
}, ironOptions);

export default Applications;
