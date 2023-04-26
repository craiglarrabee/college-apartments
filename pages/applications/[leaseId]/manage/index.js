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
import {GetApplications} from "../../../../lib/db/users/applicationInfo";

const SITE = process.env.SITE;

const Lease = ({
                   site, page, links, user, unprocessedApplications, processedApplications
               }) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1}>
                        <Tab eventKey={1} title="Unprocessed">
                            <ApplicationList data={unprocessedApplications} page={page}></ApplicationList>
                        </Tab>
                        <Tab eventKey={2} title="Processed">
                            <ApplicationList data={processedApplications} page={page}></ApplicationList>
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
    const site = context.query.site || SITE;
    if (user.admin !== site && !user.manageApartment) {
        return {notFound: true};
    }
    const editing = !!user && !!user.editSite;
    const [nav, unprocessedApplications, processedApplications] = await Promise.all([
        GetNavLinks(user, site),
        GetApplications(site, context.query.leaseId, false),
        GetApplications(site, context.query.leaseId, true)
    ]);

    return {
        props: {
            site: site,
            page: page,
            links: nav,
            canEdit: editing,
            user: {...user},
            processedApplications: processedApplications,
            unprocessedApplications: unprocessedApplications
        }
    };
}, ironOptions);

export default Lease;
