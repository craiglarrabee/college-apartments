import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetTenant} from "../lib/db/users/tenant";
import {TenantForm} from "../components/tenantForm";
import {GetUserAvailableLeaseRooms} from "../lib/db/users/roomType";

const SITE = process.env.SITE;

const Tenant = ({site, navPage, links, user, tenant, isNewApplication = false}) => {
    const bg = "white";
    const variant = "light";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <TenantForm tenant={tenant} isNewApplication={isNewApplication} site={site} userId={user.id}/>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    if (!user?.isLoggedIn) return {notFound: true};
    const newApplication = context.query && context.query.hasOwnProperty("newApplication");
    const site = context.query.site || SITE;
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: `/application?site=${site}&${new Date().getTime()}`});
        context.res.end();
        return {};
    }
    const [nav, tenant, leases] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(site, user.id),
        GetUserAvailableLeaseRooms(site, user.id)
    ]);

    if(newApplication && (!leases || leases.length === 0)) {
        console.error("redirecting to deposit from tenant due to no leases");
        context.res.writeHead(302, {Location: `/deposit?site=${site}`});
        context.res.end();
        return {};
    }

    return {
        props: {
            site: site,
            navPage: newApplication || tenant?.pending_application ? "user" : "",
            links: nav,
            user: {...user},
            tenant: {...tenant},
            isNewApplication: newApplication
        }
    };
}, ironOptions);

export default Tenant;
