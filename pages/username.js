import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {useForm} from "react-hook-form";
import UsernameForm from "../components/usernameForm";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;
const util = require("util");
const sleep = util.promisify(setTimeout);


const Username = ({site, page, links, user, ...restOfProps}) => {

    const [error, setError] = useState();
    const [success, setSuccess] = useState("");

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    {error &&
                        <Alert variant={"danger"} dismissible onClick={() => setError(null)}>{error}</Alert>
                    }
                    {success &&
                        <Alert variant={"success"} dismissible onClick={() => setSuccess(null)}>{success}</Alert>
                    }
                    <div className={classNames("main-content")} style={{width: "100%"}}>
                        <div className="h4">User Information:</div>
                        <div className="h5">Current username: {user.username}</div>
                        <UsernameForm site={site} userId={user.id} username={user.username} setUserInfoError={setError} setUserInfoSuccess={setSuccess}/>
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
   )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
	const user = context.req.session.user;
    if (!user || !user.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index.js?site=${site}`});
        context.res.end();
        return {};
    }
    const page = "username";
    const site = context.query.site || SITE;
    const [nav] = await Promise.all([GetNavLinks(user, site)]);
    return {props: {site: site, page: page, links: nav, user: {...user}}};
}, ironOptions);

export default Username;
