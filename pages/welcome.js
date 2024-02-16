import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetTenant} from "../lib/db/users/tenant";
import {Button} from "react-bootstrap";
import {WelcomeEmailBody} from "../components/welcomeEmailBody";
import ReactDomServer from "react-dom/server";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({site, page, header, body, links, canEdit, user, company, tenant, ...restOfProps}) => {
    const from = `${site}@uca.snowcollegeapartments.com`;
    const emailBody = <WelcomeEmailBody tenant={tenant} header={header} body={body}
                                        canEdit={false} company={`${company}, LLC`}
                                        site={site} page={page} userId={user.id}> </WelcomeEmailBody>;
    const emailBodyString = ReactDomServer.renderToString(emailBody);
    const sendEmail = async () => {

        try {
            const payload = {
                from: from,
                subject: `Welcome Email from ${company}`,
                address: user.email,
                body: emailBodyString
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
                    <WelcomeEmailBody tenant={tenant} header={header} body={body} canEdit={canEdit} company={company}
                                      site={site} page={page}></WelcomeEmailBody>
                    <Button style={{alignSelf: "center"}} size="lg"
                            onClick={sendEmail}>{`Send to ${tenant.email}`}</Button>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        await context.req.session.save();
	const user = context.req.session.user;
        const page = "welcome";
        const site = context.query.site || SITE;
        const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
        if (!user?.admin?.includes(site)) {
            context.res.writeHead(302, {Location: `/index?site=${site}`});
            context.res.end();
            return {};
        }
        const content = {};
        const editing = !!user && !!user.editSite;
        const [contentRows, nav, tenant] = await Promise.all([
            GetDynamicContent(site, page),
            GetNavLinks(user, site),
            GetTenant(site, user.id)
        ]);
        contentRows.forEach(row => content[row.name] = row.content);
        return {
            props: {
                site: site,
                company: company,
                page: page,
                ...content,
                links: nav,
                canEdit: editing,
                user: {...user},
                tenant: {...tenant}
            }
        };
    }
    , ironOptions);

export default Home;
