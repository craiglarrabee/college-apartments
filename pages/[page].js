import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import Content from "../components/content";
import DynamicContent, {GetDynamicContent} from "../lib/db/content/dynamicContent";
import NavLinks from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";

const SITE = process.env.SITE;

const Home = ({site, page, top, bottom, links, images, canEdit, user}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} />
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page} />
            <main>
                <Content top={top} site={site} page={page} bottom={bottom} images={images} canEdit={canEdit} />
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.replace(/\//, "");
    const site = "suu";
    const content = {};
    const [contentRows, imageContent, nav] = await Promise.all([GetDynamicContent(site, page), GetDynamicImageContent(site, page), NavLinks(site)]);
    contentRows.forEach(row => content[row.name] = row.content);
    return {props: {site: site, page: page, ...content, images: imageContent, links: nav, canEdit: !!user && !!user.editSite, user: {...user}}};
}, ironOptions);

export default Home;
