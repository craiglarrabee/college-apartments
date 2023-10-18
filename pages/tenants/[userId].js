import Layout from "../../components/layout";
import Navigation from "../../components/navigation";
import Title from "../../components/title";
import Footer from "../../components/footer";
import React from "react";
import classNames from "classnames";
import {Tab, Table, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {GetTenant} from "../../lib/db/users/tenant";
import {TenantForm} from "../../components/tenantForm";
import ApplicationForm from "../../components/applicationForm";
import {GetTenantApplications} from "../../lib/db/users/application";
import {GetLeaseRoomsMap} from "../../lib/db/users/roomType";
import {GetTenantUserLeases} from "../../lib/db/users/userLease";
import LeaseForm from "../../components/leaseForm";
import {GetDynamicContent} from "../../lib/db/content/dynamicContent";
import {GetTenantBulkEmails} from "../../lib/db/users/bulkEmail";

const SITE = process.env.SITE;

const Home = ({
                  isTenant, site, navPage, links, user, tenant, currentLeasesMap,
                  applications, userId, leases, leaseContentMap,
                  emails, applicationContent
              }) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout user={user} wide={!isTenant}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={0}>
                        <Tab title="Personal Info" eventKey={0} key={0}>
                            <TenantForm tenant={tenant} site={site} userId={userId}/>
                        </Tab>
                        <Tab title="Applications" eventKey={1} key={1}>
                            <Tabs>
                                {applications.map(application => {
                                    const currentLeases = currentLeasesMap.find(record => application.lease_id === record.leaseId).currentLeases;
                                    return (
                                        <Tab title={`${application.label}`} eventKey={`${application.lease_id}_${application.room_type_id}`}
                                             key={`${application.lease_id}_${application.room_type_id}`}>
                                            <ApplicationForm application={application}
                                                             site={site}
                                                             userId={userId}
                                                             leaseId={application.lease_id}
                                                             navPage={navPage}
                                                             currentLeases={currentLeases}
                                                             isTenant={isTenant}
                                                             {...applicationContent} />
                                        </Tab>);
                                })}
                            </Tabs>
                        </Tab>
                        <Tab title="Leases" eventKey={2} key={2}>
                            <Tabs>
                                {leases.map(lease => {
                                    const leaseContent = leaseContentMap.find(record => lease.lease_id === record.leaseId);
                                    const contentRows = leaseContent.content;
                                    const content = {};
                                    contentRows.forEach(row => content[row.name] = row.content);
                                    return (
                                        <Tab title={`${lease.label}`} eventKey={lease.lease_id}
                                             key={lease.lease_id}>
                                            <LeaseForm lease={lease}
                                                       site={site}
                                                       userId={userId}
                                                       leaseId={lease.lease_id}
                                                       navPage={navPage}
                                                       rooms={leaseContent.rooms}
                                                       {...content}
                                            />
                                        </Tab>
                                    )
                                })}
                            </Tabs>
                        </Tab>
                        {!isTenant &&
                            <Tab title="Bulk Emails" eventKey={3} key={3}>
                                <Tabs>
                                    {emails.map(email =>
                                        <Tab title={email.semester} eventKey={email.semester.replace(" ", "_")}
                                             key={email.semester.replace(" ", "_")}>
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th>Sent</th>
                                                    <th>Status</th>
                                                    <th>Failure Reason</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {email.emails.map(row => (<tr key={row.message_id}>
                                                    <td><a
                                                        href={`/email/status/${row.message_id}?site=${site}`}>{row.subject}</a>
                                                    </td>
                                                    <td>{row.sent}</td>
                                                    <td>{row.status}</td>
                                                    <td>{row.reason}</td>
                                                </tr>))}
                                                </tbody>
                                            </Table>
                                        </Tab>)}
                                </Tabs>
                            </Tab>
                            }
                    </Tabs>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const {userId} = context.query;
    const site = context.query.site || SITE;
    const user = context.req.session.user;
    const isTenant = !user.manageApartment;
    const navPage = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, isTenant ? "/" : "");
    const welcomePage = "welcome";
    let applicationContent = {};

    if (!user.isLoggedIn) return {notFound: true};
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: `/application?site=${site}`});
        context.res.end();
        return {};
    }
    const [nav, tenant, applications, leases, emails, applicationContentRows] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(site, userId),
        GetTenantApplications(userId),
        GetTenantUserLeases(userId),
        GetTenantBulkEmails(userId),
        GetDynamicContent(site, "application"),
    ]);
    applicationContentRows.forEach(row => applicationContent[row.name] = row.content);
    const currentLeasesMap = await Promise.all(applications.map(async application => {
        return {leaseId: application.lease_id, currentLeases: await GetLeaseRoomsMap(application.lease_id)}
    }));
    const leaseContentMap = await Promise.all(leases.map(async lease => {
        return {
            leaseId: lease.lease_id,
            content: await GetDynamicContent(site, `leases/${lease.lease_id}`),
            rooms: (await GetLeaseRoomsMap(lease.lease_id))[0].rooms
        }
    }));
    applications.forEach(application => {
        application.lease_room_type_id = `${application.lease_id}_${application.room_type_id}`;
        application.do_not_share_info = !application.share_info;
    });

    return {
        props: {
            isTenant: isTenant,
            site: site,
            links: nav,
            user: {...user},
            tenant: {...tenant},
            applications: applications,
            navPage: navPage,
            page: welcomePage,
            userId: userId,
            currentLeasesMap: currentLeasesMap,
            leases: leases,
            leaseContentMap: leaseContentMap,
            emails: emails,
            applicationContent: applicationContent
        }
    };
}, ironOptions);

export default Home;
