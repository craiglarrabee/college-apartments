import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {Button, Form} from "react-bootstrap";
import NavLinks from "../lib/db/content/navLinks";
import DynamicContent, {GetDynamicContent} from "../lib/db/content/dynamicContent";
import UserFormGroups from "../components/userFormGroups";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {Router} from "next/router";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";

const SITE = process.env.SITE;

const Home = ({site, page, links, canEdit, user}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    const handleSubmit = async(event) => {
        event.preventDefault();

        try {
            // Get data from the form.
            const data = {
                username: event.target.username.value,
                password: event.target.password.value,
                site: site,
            }

            // Send the data to the server in JSON format.
            const JSONdata = JSON.stringify(data)

            // API endpoint where we send form data.
            const endpoint = "/api/users"

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

            const resp = await fetch(endpoint, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                case 204:
                    await fetch("/api/login", options);
                    location = "/tenant";
            }

        } catch (e) {

        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} />
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")} style={{width: "100%"}}>
                    <Form onSubmit={handleSubmit} method="post">
                        <UserFormGroups />
                        <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" disabled={false}>Next</Button>
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
    if (user && user.isLoggedIn) {
        context.res.writeHead(302, {Location: "/tenant?newApplication"});
        context.res.end();
        return {};
    }
    const page = context.resolvedUrl.replace(/\//, "");
    const site = "suu";
    const content = {};
    const [contentRows, imageContent, nav] = await Promise.all([GetDynamicContent(site, page), GetDynamicImageContent(site, page), NavLinks(site)]);
    contentRows.forEach(row => content[row.name] = row.content);
    return {props: {site: site, page: page, ...content, images: imageContent, links: nav, canEdit: !!user && !!user.editSite, user: {...user}}};
}, ironOptions);

export default Home;
