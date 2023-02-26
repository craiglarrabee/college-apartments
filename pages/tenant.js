import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {Button, Form} from "react-bootstrap";
import NavLinks from "../lib/db/content/navLinks";
import TenantFormGroups from "../components/tenantFormGroups";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetTenantInfo} from "../lib/db/users/tenantInfo";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";

const SITE = process.env.SITE;

const Home = ({site, page, navPage, links, canEdit, user, tenant, isNewApplication=false}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    const handleSubmit = async (event) => {
        event.preventDefault();
        const convicted = event.target.convicted_crime_true.checked;
        const charged = event.target.charged_crime_true.checked;

        try {
            // Get data from the form.
            const data = {
                last_name: event.target.last_name.value,
                first_name: event.target.first_name.value,
                middle_name: event.target.middle_name.value,
                gender: event.target.gender.value,
                date_of_birth: event.target.date_of_birth.value,
                last_4_social: event.target.last_4_social.value,
                cell_phone: event.target.cell_phone.value,
                home_phone: event.target.home_phone.value,
                email: event.target.email.value,
                convicted_crime: convicted,
                convicted_explain: convicted ? event.target.convicted_explain.value : null,
                charged_crime: charged,
                charged_explain: charged ? event.target.charged_explain.value : null,
                street: event.target.street.value,
                city: event.target.city.value,
                state: event.target.state.value,
                zip: event.target.zip.value,
                parent_name: event.target.parent_name.value,
                parent_street: event.target.parent_street.value,
                parent_city: event.target.parent_city.value,
                parent_state: event.target.parent_state.value,
                parent_zip: event.target.parent_zip.value,
                parent_phone: event.target.parent_phone.value,
            }

            // Send the data to the server in JSON format.
            const JSONdata = JSON.stringify(data)

            // Form the request for sending data to the server.
            const options = {
                // The method is POST because we are sending data.
                method: "POST",
                // Tell the server we're sending JSON.
                headers: {
                    "Content-Type": "application/json",
                },
                // Body of the request is the JSON data we created above.
                body: JSONdata,
            }

            const resp = await fetch(`/api/users/${user.id}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    if (isNewApplication) location = "/application";
            }

        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit} method="post">
                        <TenantFormGroups readOnly={canEdit} tenantData={tenant}/>
                        <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" >{isNewApplication ? "Next" : "Save"}</Button>
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
    const tenant = await GetTenantInfo(user.id);
    const newApplication = context.query && context.query.hasOwnProperty("newApplication");
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: "/application"});
        context.res.end();
        return {};
    }
    const site = "suu";
    const page = "tenant";
    const content = {};
    const [contentRows, imageContent, nav] = await Promise.all([GetDynamicContent(site, page), GetDynamicImageContent(site, page), NavLinks(site)]);
    contentRows.forEach(row => content[row.name] = row.content);
    if (tenant) tenant.date_of_birth = tenant.date_of_birth.toISOString().split("T")[0];
    return {props: {site: site, page: page, navPage: newApplication ? "start-application" : "", ...content, images: imageContent, links: nav, canEdit: !!user && !!user.editSite, user: {...user}, tenant: {...tenant}, isNewApplication: newApplication}};
}, ironOptions);

export default Home;
