import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {Button} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({site, user, links, navPage, ...restOfProps }) => {

    const onSubmit = async (data, event) => {

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
            }

            const resp = await fetch(`/api/util/bulk-email-process?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout site={site}  user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Button onClick={onSubmit} >Send</Button>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    if (!user.isLoggedIn) return {notFound: true};
    const site = context.query.site || SITE;
    const [nav] = await Promise.all([
        GetNavLinks(user, site)
    ]);
    return {
        props: {
            site: site,
            user: user,
            links: nav,
            navPage: "process"
        }
    };
}, ironOptions);

export default Home;
