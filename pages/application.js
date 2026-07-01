import Layout from "../components/layout";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("../components/navigation"), { ssr: false });
import {isBot} from "../lib/bots";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetUserAvailableLeaseRooms} from "../lib/db/users/roomType";
import {GetTenant} from "../lib/db/users/tenant";
import NewApplicationForm from "../components/newApplicationForm";
import {IsDepositPaid, IsReturningStudent} from "../lib/db/users/application";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Application = ({
                         site,
                         page,
                         navPage,
    isABot,
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
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
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
                                            previous_rental={previous_rental}
                                            isReturningStudent={restOfProps.isReturningStudent}
                                            isDepositPaid={restOfProps.isDepositPaid}
                                            depositAmount={restOfProps.depositAmount}
                                            privacyContent={restOfProps.privacyContent}
                                            refundContent={restOfProps.refundContent}
                                            useSquareEnabled={restOfProps.useSquareEnabled} />
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

    const currentRooms = await GetUserAvailableLeaseRooms(site, editing ? "" : user.id);
    const targetLeaseId = currentRooms && currentRooms.length > 0 ? currentRooms[0].lease_id : null;

    const [contentRows, nav, tenant, isReturningStudent, isDepositPaid, privacyContent, refundContent] = await Promise.all([
        GetDynamicContent(site, page),
        GetNavLinks(user, site),
        GetTenant(site, user.id),
        IsReturningStudent(user.id, site, targetLeaseId),
        IsDepositPaid(user.id, site),
        GetDynamicContent(site, "privacy%"),
        GetDynamicContent(site, "refund")
    ]);

    if (!isReturningStudent) {
        console.log(`[DEBUG] User ${user.id} (${tenant?.username}) is NOT considered returning student for site ${site}, targetLeaseId ${targetLeaseId}.`);
    }

    console.log(`[DEBUG] Application page check for user ${user.id} (${tenant?.username}) site ${site}: isReturningStudent=${isReturningStudent}, isDepositPaid=${isDepositPaid}, targetLeaseId=${targetLeaseId}`);

    if (!currentRooms || currentRooms.length === 0) {
        console.error(`${new Date().toISOString()} -` +"redirecting to deposit due to no current rooms");
        context.res.writeHead(302, {Location: `/deposit?site=${site}`});
        context.res.end();
        return {};
    }
    contentRows.forEach(row => content[row.name] = row.content);
    let currentLeases = [...new Set(currentRooms.map(room => room.lease_id))];
    const depositAmount = currentRooms[0]?.deposit_amount !== undefined ? Number(currentRooms[0].deposit_amount) : undefined;
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });

    let privacy = Object.fromEntries(privacyContent.map(it => {
        return [it.page.replace("privacy-", ""), it.content];
    }));

    let refund = refundContent?.find(content => content.name === "top")?.content;

    return {
        props: {
            site: site,
            page: page,
            navPage: "user",
            ...content,
            links: nav,
            isABot: isBot(context),
            canEdit: editing,
            user: {...user},
            currentLeases: currentLeases,
            company: company,
            tenant: {...tenant},
            isReturningStudent,
            isDepositPaid,
            depositAmount: depositAmount,
            privacyContent: privacy || [],
            refundContent: refund || "",
            useSquareEnabled: process.env.USE_SQUARE_FOR_SNOW === 'true'
        }
    };
}, ironOptions);

export default Application;
