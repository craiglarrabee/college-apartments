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

const SITE = process.env.SITE;

const Index = ({site, page, links, user, details}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout user={user}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className="h4">Bulk email sent on {details[0].created} with subject: <strong>{details[0].subject}</strong></div>
                <div className="h4">Status: <strong>{details[0].completed ? "Complete" : "In process"}</strong></div>
                <Tabs>
                    <Tab style={{minHeight: "350px"}} title="Failures" eventKey={"failures"}>
                        <Table >
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
                    <Tab style={{minHeight: "350px"}} title="Successes" eventKey={"successes"}>
                        <Table >
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email Address</th>
                                <th>Sent</th>
                            </tr>
                            </thead>
                            <tbody>
                            {details.filter(row => "success" === row.status).map(row => (<tr key={row.message_id}>
                                <td><a href={`/${page}/${row.message_id}?site=${site}`}>{row.subject}</a></td>
                                <td>{row.created}</td>
                                <td>{row.completed}</td>
                                <td></td>
                            </tr>))}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        const user = context.req.session.user;
        const page = "email/status";
        const site = context.query.site || SITE;
        const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";

        if (!user.admin.includes(site)) return {notFound: true};
        const [nav, messageDetails] = await Promise.all([
            GetNavLinks(user, site),
            GetBulkEmailDetails(context.query.messageId)
        ]);

        return {
            props: {
                company: company,
                site: site,
                page: page,
                links: nav,
                user: {...user},
                details: messageDetails
            }
        };
    }
    , ironOptions);

export default Index;
