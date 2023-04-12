import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React from "react";
import {GetDynamicContent} from "../../../../lib/db/content/dynamicContent";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import classNames from "classnames";
import {Form, Tab, Tabs} from "react-bootstrap";
import PageContent from "../../../../components/pageContent";
import {useForm} from "react-hook-form";
import LeaseDefinitionGroup from "../../../../components/leaseDefinitionGroup";
import {GetLease} from "../../../../lib/db/users/lease";
import {GetLeaseRooms} from "../../../../lib/db/users/roomType";
import LeaseRoom from "../../../../components/leaseRoom";

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
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1}>
                        <Tab eventKey={1} title="Unprocessed">
                            <ApplicationList data={unprocessedApplications}></ApplicationList>
                        </Tab>
                        <Tab eventKey={2} title="Processed">
                            <ApplicationList data={unprocessedApplications}></ApplicationList>
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
    const content = {};
    const editing = !!user && !!user.editSite;
    const [nav] = await Promise.all([
        GetNavLinks(user, site)
    ]);

    return {props: {site: site, page: page, links: nav, canEdit: editing, user: {...user}}};
}, ironOptions);

export default Lease;
