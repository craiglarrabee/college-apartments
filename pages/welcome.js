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

const Home = ({site, page, header, body, links, canEdit, user, company}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const today = new Date().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div>{company}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{today}</div>
                <PageContent
                    initialContent={header}
                    site={site}
                    page={page}
                    name="header"
                    canEdit={canEdit}/>
                <div>Dear ___________:</div>
                <br/>
                <PageContent
                    initialContent={body}
                    site={site}
                    page={page}
                    name="body"
                    canEdit={canEdit}/>
                <div>----------------- **IMPORTANT** -----------------------------------------------<br/>
                    Follow this link to electronically complete and submit your <a
                        href="https://snowcollegeapartments.com/suu/lease.php?sid=45a2<<sid>>67z3">Lease</a><br/>
                    <br/>
                    Follow this link to view your <a href="https://snowcollegeapartments.com/suu/roomates.php?sid=45a2<<sid>>67z3">room assignment
                        and roomates</a><br/>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        const user = context.req.session.user;
        const page = context.resolvedUrl.replace(/\//, "");
        const site = "suu";
        const company = "Stadium Way/College Way Apartments, LLC";
        if (user.admin !== site) return {notFound: true};
        const content = {};
        const editing = !!user && !!user.editSite;
        const [contentRows, nav] = await Promise.all([GetDynamicContent(site, page), GetNavLinks(site, editing)]);
        contentRows.forEach(row => content[row.name] = row.content);
        return {props: {site: site, company: company, page: page, ...content, links: nav, canEdit: editing, user: {...user}}};
    }
    , ironOptions);

export default Home;
