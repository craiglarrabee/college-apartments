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
import {GetLeaseRooms} from "../../../../lib/db/users/roomType";
import {GetUserLease} from "../../../../lib/db/users/userLease";
import LeaseForm from "../../../../components/leaseForm";
import {isBot} from "../../../../lib/bots";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Lease = ({site, isABot,  navPage, lease, links, user, userId, rooms, content, ...restOfProps}) => {

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        <LeaseForm site={site} navPage={navPage} userId={userId} lease={lease} {...content}
                                   rooms={rooms}/>
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
    const {userId, leaseId} = context.query;

    const navPage = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, "");
    const page = navPage.replace("/manage", "");
    const site = context.query.site || SITE;
    if (!user?.admin?.includes(site)) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const content = {};
    const [lease, contentRows, nav, rooms] = await Promise.all([
        GetUserLease(userId, leaseId),
        GetDynamicContent(site, page),
        GetNavLinks(user, site),
        GetLeaseRooms(leaseId)
    ]);
    contentRows.forEach(row => content[row.name] = row.content);

    return {
        props: {
            lease: {...lease},
            site: site,
            navPage: navPage,
            content: content,
            links: nav,
            isABot: isBot(context),
            canEdit: false,
            user: {...user},
            rooms: rooms,
            userId: userId
        }
    };
}, ironOptions);

export default Lease;
