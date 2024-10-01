import Layout from "../components/layout";
import Navigation from "../components/navigation";
import {isBot} from "../lib/bots";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import Content from "../components/content";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({site, isABot,  page, top, bottom, links, images, canEdit, user, ...restOfProps}) => {

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page="user"/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <Content top={top} site={site} page={page} bottom={bottom} images={images} canEdit={canEdit}
                             restOfProps={restOfProps}/>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
	const user = context.req.session.user;
    const page = "deposit";
    const site = context.query.site || SITE;
    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const content = {};
    const editing = !!user && !!user.editSite;
    const [contentRows, imageContent, nav] = await Promise.all([GetDynamicContent(site, page), GetDynamicImageContent(site, page), GetNavLinks(user, site)]);
    contentRows.forEach(row => content[row.name] = row.content);
    return {
        props: {
            site: site,
            page: page, ...content,
            images: imageContent,
            links: nav,
            isABot: isBot(context),
            canEdit: editing,
            user: {...user}
        }
    };
}, ironOptions);

export default Home;
