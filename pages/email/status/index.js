import Layout from "../../../components/layout";
import Navigation from "../../../components/navigation";
import Title from "../../../components/title";
import Footer from "../../../components/footer";
import React from "react";
import {GetNavLinks} from "../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import {Tab, Table, Tabs} from "react-bootstrap";
import {GetActiveSemesters} from "../../../lib/db/users/userLease";
import {GetSemesterBulkEmails} from "../../../lib/db/users/bulkEmail";
import {isBot} from "../../../lib/bots";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Index = ({site, isABot,  page, links, user, semesters, emails, ...restOfProps}) => {

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <Tabs>
                        {semesters.map((item) =>
                            <Tab style={{minHeight: "390px"}} title={item.semester}
                                 eventKey={item.semester.replace(" ", "_")} key={item.semester.replace(" ", "_")}>
                                <Table>
                                    <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Created Date</th>
                                        <th>Completed</th>
                                        <th>Failures</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {emails.filter(email => email.semester === item.semester).map(row => (
                                        <tr key={row.message_id}>
                                            <td><a href={`/${page}/${row.message_id}?site=${site}`}>{row.subject}</a>
                                            </td>
                                            <td>{row.created}</td>
                                            <td>{row.completed}</td>
                                            <td>{row.failed_count}</td>
                                        </tr>))}
                                    </tbody>
                                </Table>
                            </Tab>
                        )}
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
        if (!user.manage.includes(site)) {
            res.status(403).send();
            return;
        }

        const [nav, semesters] = await Promise.all([
            GetNavLinks(user, site),
            GetActiveSemesters(site)
        ]);

        const emails = await GetSemesterBulkEmails(site, semesters.map(semester => semester.semester));

        return {
            props: {
                site: site,
                page: page,
                links: nav,
                isABot: isBot(context),
                user: {...user},
                semesters: [...semesters],
                emails: [...emails]
            }
        };
    }
    , ironOptions);

export default Index;
