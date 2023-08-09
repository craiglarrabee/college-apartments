import Layout from "../../components/layout";
import Navigation from "../../components/navigation";
import Title from "../../components/title";
import Footer from "../../components/footer";
import React from "react";
import classNames from "classnames";
import {Tab, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {GetTenant} from "../../lib/db/users/tenant";
import {TenantForm} from "../../components/tenantForm";
import ApplicationForm from "../../components/applicationForm";
import {GetTenantApplications} from "../../lib/db/users/application";
import {GetCurrentLeases} from "../../lib/db/users/roomType";

const SITE = process.env.SITE;

const Home = ({site, navPage, links, user, tenant, currentLeasesMap, applications, userId}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={0}>
                        <Tab title="Personal Info" eventKey={0}>
                                <TenantForm tenant={tenant} site={site} userId={userId} />
                        </Tab>
                        {applications.map(application => {
                            const currentLeases = currentLeasesMap.filter(record => application.lease_id === record.leaseId)[0].currentLeases;
                            return (
                                <Tab title={`${application.label} Application`} eventKey={application.lease_id}>
                                    <ApplicationForm application={application}
                                                     site={site}
                                                     userId={userId}
                                                     leaseId={application.lease_id}
                                                     navPage={navPage}
                                                     currentLeases={currentLeases}/>
                                </Tab>);
                        })}
                        <Tab title="Bulk Emails" eventKey={"emails"}>

                        </Tab>
                    </Tabs>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const {userId} = context.query;
    const navPage = context.resolvedUrl.substring(0,context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, "");
    const welcomePage = "welcome";
    const site = context.query.site || SITE;
    const user = context.req.session.user;

    if (!user.isLoggedIn) return {notFound: true};
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: "/application"});
        context.res.end();
        return {};
    }
    const [nav, tenant, applications] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(userId),
        GetTenantApplications(userId)
    ]);
    const currentLeasesMap = await Promise.all(applications.map(async application => {return {leaseId: application.lease_id, currentLeases: await GetCurrentLeases(application.lease_id)}}));

    applications.forEach(application => {
        application.lease_room_type_id = `${application.lease_id}_${application.room_type_id}`;
        application.do_not_share_info = !application.share_info;
    });

    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            tenant: {...tenant},
            applications: applications,
            navPage: navPage,
            page: welcomePage,
            userId: userId,
            currentLeasesMap: currentLeasesMap
        }
    };
}, ironOptions);

export default Home;
