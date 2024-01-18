import Layout from "../../../components/layout";
import Navigation from "../../../components/navigation";
import Title from "../../../components/title";
import Footer from "../../../components/footer";
import React from "react";
import {GetNavLinks} from "../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import classNames from "classnames";
import {GetUserRoomates} from "../../../lib/db/users/tenant";
import {UserApartment} from "../../../components/assignments";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Lease = ({site, page, tenants, links, user, ...restOfProps}) => {
    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page="index"/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}
                       startWithLogin={!user.isLoggedIn}/>
                <main>
                    <div className={classNames("main-content")}>
                        {user && user.isLoggedIn ?
                            <><UserApartment data={tenants}/></>
                            : <></>}
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "");
    const site = context.query.site || SITE;
    const [tenants, nav] = await Promise.all([
        user && user.isLoggedIn ? GetUserRoomates(user.id, context.query.semester.replace("_", " ")) : [],
        GetNavLinks(user, site)
    ]);

    return {
        props: {
            site: site,
            page: page,
            links: nav,
            user: {...user},
            tenants: [...tenants]
        }
    };
}, ironOptions);

export default Lease;
