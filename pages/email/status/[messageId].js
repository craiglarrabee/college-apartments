import Layout from "../../../components/layout";
import Navigation from "../../../components/navigation";
import Title from "../../../components/title";
import Footer from "../../../components/footer";
import React from "react";
import {GetNavLinks} from "../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {Tab, Table, Tabs} from "react-bootstrap";
import {GetBulkEmailDetails} from "../../../lib/db/users/bulkEmail";
import {isBot} from "../../../lib/bots";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Index = ({site, isABot,  page, links, user, details, ...restOfProps}) => {

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className="h4">Bulk email sent on {details[0].created} with
                        subject: <strong>{details[0].subject}</strong></div>
                    <div className="h4">Status: <strong>{details[0].completed ? "Complete" : "In process"}</strong>
                    </div>
                    <Tabs>
                        <Tab style={{minHeight: "350px"}} title="Failures" eventKey={"failures"} key={"failures"}>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email Address</th>
                                    <th>Sent</th>
                                    <th>Reason</th>
                                </tr>
                                </thead>
                                <tbody>
                                {details.filter(row => "failure" === row.status).map(row => (<tr key={row.user_id}>
                                    <td><a href={`/tenants/${row.user_id}?site=${site}`}>{row.name}</a></td>
                                    <td>{row.address}</td>
                                    <td>{row.sent}</td>
                                    <td>{row.reason}</td>
                                </tr>))}
                                </tbody>
                            </Table>
                        </Tab>
                        <Tab style={{minHeight: "350px"}} title="Successes" eventKey={"successes"} key={"successes"}>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email Address</th>
                                    <th>Sent</th>
                                </tr>
                                </thead>
                                <tbody>
                                {details.filter(row => "success" === row.status).map(row => (<tr key={row.user_id}>
                                    <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
                                    <td>{row.address}</td>
                                    <td>{row.sent}</td>
                                </tr>))}
                                </tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        await context.req.session.save();
	const user = context.req.session.user;
        const page = "email/status";
        const site = context.query.site || SITE;
        if (!user.manageApartment || !user.admin.includes(site)) {
            res.status(403).send();
            return;
        }

        const [nav, messageDetails] = await Promise.all([
            GetNavLinks(user, site),
            GetBulkEmailDetails(context.query.messageId)
        ]);

        return {
            props: {
                site: site,
                page: page,
                links: nav,
                isABot: isBot(context),
                user: {...user},
                details: messageDetails
            }
        };
    }
    , ironOptions);

export default Index;
