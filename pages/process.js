import Layout from "../components/layout";
import Navigation from "../components/navigation";
import {isBot} from "../lib/bots";
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


const Home = ({site, isABot,  user, links, navPage, ...restOfProps}) => {

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
            console.error(new Date().toISOString() + " - " +e);
        }
    }

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        <Button onClick={onSubmit}>Send</Button>
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
    const site = context.query.site || SITE;
    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const [nav] = await Promise.all([
        GetNavLinks(user, site)
    ]);
    return {
        props: {
            site: site,
            user: user,
            links: nav,
            isABot: isBot(context),
            navPage: "process"
        }
    };
}, ironOptions);

export default Home;
