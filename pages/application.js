import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import WorkFormGroups from "../components/workFormGroups";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import PageContent from "../components/pageContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {useForm} from "react-hook-form";
import {GetUserAvailableLeaseRooms} from "../lib/db/users/roomType";
import CurrentLeases from "../components/currentLeases";
import {GetTenant} from "../lib/db/users/tenant";
import ApplicationFormGroups from "../components/ApplicationFormGroups";
import NewApplicationForm from "../components/newApplicationForm";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Application = ({
                         site,
                         page,
                         navPage,
                         rules,
                         previous_rental,
                         esa_packet,
                         disclaimer,
                         guaranty,
                         links,
                         canEdit,
                         user,
                         currentLeases,
                         company,
                         tenant,
                         ...restOfProps
                     }) => {

    return (
        <Layout site={site} user={user} wide={false}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        <NewApplicationForm site={site}
                                            tenant={tenant}
                                            page={page}
                                            userId={user.id}
                                            user={user}
                                            canEdit={canEdit}
                                            disclaimer={disclaimer}
                                            currentLeases={currentLeases}
                                            esa_packet={esa_packet}
                                            guaranty={guaranty}
                                            rules={rules}
                                            previous_rental={previous_rental} />
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
    const page = "application";
    const site = context.query.site || SITE;
    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const content = {};
    const editing = !!user && !!user.editSite;
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const [contentRows, nav, currentRooms, tenant] = await Promise.all([
        GetDynamicContent(site, page),
        GetNavLinks(user, site),
        GetUserAvailableLeaseRooms(site, editing ? "" : user.id),
        GetTenant(site, user.id)
    ]);

    if (!currentRooms || currentRooms.length === 0) {
        console.error("redirecting to deposit due to no current rooms");
        context.res.writeHead(302, {Location: `/deposit?site=${site}`});
        context.res.end();
        return {};
    }
    contentRows.forEach(row => content[row.name] = row.content);
    let currentLeases = [...new Set(currentRooms.map(room => room.lease_id))];
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });

    return {
        props: {
            site: site,
            page: page,
            navPage: "user",
            ...content,
            links: nav,
            canEdit: editing,
            user: {...user},
            currentLeases: currentLeases,
            company: company,
            tenant: {...tenant}
        }
    };
}, ironOptions);

export default Application;
