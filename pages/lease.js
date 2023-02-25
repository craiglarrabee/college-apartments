import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {Button, Form} from "react-bootstrap";
import NavLinks from "../lib/db/content/navLinks";
import ApplicationFormGroups from "../components/applicationFormGroups";
import WorkFormGroups from "../components/workFormGroups";
import DynamicContent, {GetDynamicContent} from "../lib/db/content/dynamicContent";
import PageContent from "../components/pageContent";
import Link from "next/link";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";

const SITE = process.env.SITE;

const Home = ({site, page, navPage, rules, disclaimer, guaranty, links, canEdit, user}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} />
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form action="deposit" method="post">
                        {site === "suu" ? <WorkFormGroups readOnly={canEdit}/> : null}
                        <ApplicationFormGroups readOnly={canEdit}/>
                        <PageContent
                            initialContent={rules}
                            site={site}
                            page={page}
                            name="rules"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={disclaimer}
                            site={site}
                            page={page}
                            name="disclaimer"
                            canEdit={canEdit}/>
                        <div className={classNames("mb-3", "d-inline-flex")}>
                            <Form.Check className="mb-3" name="installments" type="checkbox" id="installments" />
                            <span>
                                <div>
                                    Check here if you want to pay in installments. <br/>
                                    <PageContent
                                        initialContent={guaranty}
                                        site={site}
                                        page={page}
                                        name="guaranty"
                                        canEdit={canEdit} />
                                </div>
                            </span>
                        </div>
                        <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" disabled={canEdit}>Submit</Button>
                        </div>
                    </Form>
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
    const content = {};
    const [contentRows, imageContent, nav] = await Promise.all([GetDynamicContent(site, page), GetDynamicImageContent(site, page), NavLinks(site)]);
    contentRows.forEach(row => content[row.name] = row.content);
    return {props: {site: site, page: page, navPage: "start-application", ...content, images: imageContent, links: nav, canEdit: !!user.editSite, user: {...user}}};
}, ironOptions);

export default Home;
