import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetTenantInfo} from "../lib/db/users/tenantInfo";
import {Button} from "react-bootstrap";
import {WelcomeEmailBody} from "../components/welcomeEmailBody";
import ReactDomServer from "react-dom/server";

const SITE = process.env.SITE;

const Home = ({site, page, header, body, links, canEdit, user, company, tenant}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const emailBody = <WelcomeEmailBody tenant={tenant} header={header} body={body}
                                        canEdit={false} company={company}
                                        site={site} page={page}></WelcomeEmailBody>;
    const bob = ReactDomServer.renderToString(emailBody);
    const sendEmail = async () => {

        try {
            const payload = {
                address: user.email,
                body: bob
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/email`, options);
            switch (resp.status) {
                case 400:
                    alert("An error occurred sending the email.");
                    break;
                case 204:
                    alert("Email sent.");
                    break;
            }
        } catch (e) {
            alert(`An error occurred sending the email. ${e.message}`);
            console.log(e);
        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <WelcomeEmailBody tenant={tenant} header={header} body={body} canEdit={canEdit} company={company}
                                  site={site} page={page}></WelcomeEmailBody>
                <Button style={{alignSelf: "center"}} size="lg" onClick={sendEmail}>{`Send to ${tenant.email}`}</Button>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        const user = context.req.session.user;
        const page = context.resolvedUrl.replace(/\//, "");
        const site = SITE;
        const company = "Stadium Way/College Way Apartments, LLC";
        if (user.admin !== site) return {notFound: true};
        const content = {};
        const editing = !!user && !!user.editSite;
        const [contentRows, nav, tenant] = await Promise.all([
            GetDynamicContent(site, page),
            GetNavLinks(user, site),
            GetTenantInfo(user.id)
        ]);
        contentRows.forEach(row => content[row.name] = row.content);
        if (tenant) tenant.date_of_birth = tenant.date_of_birth.toISOString().split("T")[0];
        return {
            props: {
                site: site,
                company: company,
                page: page, ...content,
                links: nav,
                canEdit: editing,
                user: {...user},
                tenant: {...tenant}
            }
        };
    }
    , ironOptions);

export default Home;
