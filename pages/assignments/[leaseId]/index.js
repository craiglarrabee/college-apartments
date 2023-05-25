import Layout from "../../../components/layout";
import Navigation from "../../../components/navigation";
import Title from "../../../components/title";
import Footer from "../../../components/footer";
import React from "react";
import {GetDynamicContent} from "../../../lib/db/content/dynamicContent";
import {GetNavLinks} from "../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import classNames from "classnames";
import {Button, Col, Form, Row} from "react-bootstrap";
import PageContent from "../../../components/pageContent";
import {useForm} from "react-hook-form";
import LeaseDefinitionGroup from "../../../components/leaseDefinitionGroup";
import {GetLease} from "../../../lib/db/users/lease";
import {GetLeaseRooms} from "../../../lib/db/users/roomType";
import LeaseRoom from "../../../components/leaseRoom";
import {GetUserLease} from "../../../lib/db/users/userLease";
import {GetUserRoomates} from "../../../lib/db/users/tenant";
import {UserApartment} from "../../../components/assignments";

const SITE = process.env.SITE;

const Lease = ({
                   site, page, tenants, links, user
               }) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} startWithLogin={!user.isLoggedIn} />
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page="index"/>
            <main>
                <div className={classNames("main-content")}>
                    {user && user.isLoggedIn ?
                    <><UserApartment data={tenants} /></>
                        : <></> }
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
    const content = {};
    const [tenants, nav] = await Promise.all([
        user && user.isLoggedIn ? GetUserRoomates(user.id, context.query.leaseId): [],
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
