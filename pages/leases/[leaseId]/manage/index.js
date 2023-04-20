import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import classNames from "classnames";
import {Tab, Tabs} from "react-bootstrap";
import {ApplicationList} from "../../../../components/applicationList";
import {GetUserLeases} from "../../../../lib/db/users/userLease";

const SITE = process.env.SITE;

const Lease = ({
                   site, page, links, user, submittedLeases, pendingLeases
               }) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1}>
                        <Tab eventKey={1} title="Submitted">
                            <ApplicationList data={submittedLeases} page={page}></ApplicationList>
                        </Tab>
                        <Tab eventKey={2} title="Pending">
                            <ApplicationList data={pendingLeases} page={page}></ApplicationList>
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
    const page = context.resolvedUrl.replace(/\//, "");
    const site = SITE;
    if (user.admin !== site && !user.manageApartment) {
        return {notFound: true};
    }
    const editing = !!user && !!user.editSite;
    const [nav, pendingLeases, submittedLeases] = await Promise.all([
        GetNavLinks(user, site),
        GetUserLeases(context.query.leaseId, false),
        GetUserLeases(context.query.leaseId, true)
    ]);

    return {
        props: {
            site: site,
            page: page,
            links: nav,
            canEdit: editing,
            user: {...user},
            submittedLeases: submittedLeases,
            pendingLeases: pendingLeases
        }
    };
}, ironOptions);

export default Lease;