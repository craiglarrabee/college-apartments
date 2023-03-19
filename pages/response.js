import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import Content from "../components/content";
import DynamicContent, {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";
import PageContent from "../components/pageContent";

const SITE = process.env.SITE;

const Home = ({site, page, body, links, canEdit, user}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} />
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page} />
            <main>
                <PageContent
                    initialContent={body}
                    site={site}
                    page={page}
                    name="body"
                    canEdit={canEdit}/>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.replace(/\//, "");
    const site = "suu";
    if (user.admin !== site) return {notFound: true};
    const content = {};
    const editing = !!user && !!user.editSite;
    const [contentRows, nav] = await Promise.all([GetDynamicContent(site, page), GetNavLinks(site, editing)]);
    contentRows.forEach(row => content[row.name] = row.content);
    return {props: {site: site, page: page, ...content, links: nav, canEdit: editing, user: {...user}}};
}, ironOptions);

export default Home;
