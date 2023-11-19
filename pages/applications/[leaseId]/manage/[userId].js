import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React from "react";
import classNames from "classnames";
import {Tab, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {GetUserLeaseTenant} from "../../../../lib/db/users/tenant";
import {TenantForm} from "../../../../components/tenantForm";
import ApplicationForm from "../../../../components/applicationForm";
import {GetLeaseRoomsMap} from "../../../../lib/db/users/roomType";
import {GetApplication} from "../../../../lib/db/users/application";
import {GetDynamicContent} from "../../../../lib/db/content/dynamicContent";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({site, navPage, links, user, tenant, currentLeases, application, userId, leaseId, content, ...restOfProps }) => {

    return (
        <Layout site={site}  user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1}>
                        <Tab title="Personal Info" eventKey={1} key={1}>
                            <TenantForm tenant={tenant} site={site} userId={userId} />
                        </Tab>
                        <Tab title="Application" eventKey={2} key={2}>
                            <ApplicationForm {...content} application={application} site={site} userId={userId} leaseId={leaseId} navPage={navPage} currentLeases={currentLeases} roomTypeId={tenant.room_type_id} />
                        </Tab>
                    </Tabs>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const {userId, leaseId, roomTypeId} = context.query;
    const navPage = context.resolvedUrl.substring(0,context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, "");
    const page = "application";
    const welcomePage = "welcome";
    const site = context.query.site || SITE;
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const user = context.req.session.user;
    let content = {};

    if (!user.isLoggedIn) return {notFound: true};
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: `/application?site=${site}`});
        context.res.end();
        return {};
    }
    const [welcomeRows, contentRows, nav, tenant, currentLeases, application] = await Promise.all([
        GetDynamicContent(site, welcomePage),
        GetDynamicContent(site, page),
        GetNavLinks(user, site),
        GetUserLeaseTenant(userId, leaseId, roomTypeId),
        GetLeaseRoomsMap(leaseId),
        GetApplication(site, userId, leaseId, roomTypeId)
    ]);

    contentRows.forEach(row => content[row.name] = row.content);
    if (application) {
        application.lease_room_type_id = `${application.lease_id}_${application.room_type_id}`;
        application.do_not_share_info = !application.share_info;
    }

    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            tenant: {...tenant},
            content: content,
            ...welcomeRows,
            currentLeases: currentLeases,
            application: application,
            navPage: navPage,
            page: page,
            welcomePage: welcomePage,
            userId: userId,
            leaseId: leaseId,
        }
    };
}, ironOptions);

export default Home;
