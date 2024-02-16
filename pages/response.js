import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import PageContent from "../components/pageContent";
import {Button} from "react-bootstrap";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({site, page, body, links, canEdit, user, company, ...restOfProps}) => {
    const from = `${site}@uca.snowcollegeapartments.com`;
    const brandUrl = "http://www.utahcollegeapartments.com";

    const sendEmail = async () => {

        try {
            const payload = {
                from: from,
                subject: `Welcome to ${company}`,
                address: user.email,
                body: body
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/email?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    alert("An error occurred sending the email.");
                    break;
                case 204:
                    alert("Send sent.");
                    break;
            }
        } catch (e) {
            alert(`An error occurred sending the email. ${e.message}`);
            console.error(e);
        }
    }


    return (
        <Layout site={site} user={user}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <PageContent
                        initialContent={body}
                        site={site}
                        page={page}
                        name="body"
                        canEdit={canEdit}/>
                    <Button style={{alignSelf: "center"}} size="lg"
                            onClick={sendEmail}>{`Send to ${user.email}`}</Button>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
	const user = context.req.session.user;
    const page = "response";
    const site = context.query.site || SITE;
    if (!user?.admin?.includes(site)) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const content = {};
    const editing = !!user && !!user.editSite;
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const [contentRows, nav] = await Promise.all([GetDynamicContent(site, page), GetNavLinks(user, site)]);
    contentRows.forEach(row => content[row.name] = row.content);
    return {
        props: {
            site: site,
            page: page, ...content,
            links: nav,
            canEdit: editing,
            user: {...user},
            company: company
        }
    };
}, ironOptions);

export default Home;
