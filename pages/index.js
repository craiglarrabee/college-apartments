import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import Content from "../components/content";
import PageContent from "../components/pageContent";
import ConnectionPool from "../lib/db/connection";

const SITE = process.env.SITE;

const Home = ({top, bottom, links}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout>
            <Title bg={bg} variant={variant} brandUrl={brandUrl}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links}/>
            <main>
                <Content>
                    <PageContent
                        initialContent={top}
                        site={SITE}
                        page="index"
                        name="top"
                        canEdit={true}/>
                    <img src="/images/students.jpg" alt="students"/>
                    <PageContent
                        initialContent={bottom}
                        site={SITE}
                        page="index"
                        name="bottom"
                        canEdit={true}/>
                </Content>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export async function getStaticProps() {
    const conn = await ConnectionPool();
    let [rows] = await conn.execute("SELECT name, content FROM site_content WHERE site = ? AND page = ?", [SITE, "index"]);
    let props = {};
    //we should only be able to get 1 row
    //default to using first row
    rows.forEach(row => props[row.name] = row.content);
    [rows] = await conn.execute("SELECT parent_page, page, label, sub_menu FROM site_nav WHERE site = ? ORDER BY position", [SITE]);
    props.links = rows;
    return {
        props: props
    }
}

export default Home;
