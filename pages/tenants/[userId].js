import Layout from "../../components/layout";
import Navigation from "../../components/navigation";
import Title from "../../components/title";
import Footer from "../../components/footer";
import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {Alert, Button, Form, Tab, Table, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {GetTenant, GetUserRoomates} from "../../lib/db/users/tenant";
import {TenantForm} from "../../components/tenantForm";
import ApplicationForm from "../../components/applicationForm";
import {GetTenantApplications} from "../../lib/db/users/application";
import {GetLeaseRoomsMap, GetUserAvailableLeaseRooms} from "../../lib/db/users/roomType";
import {GetTenantUserLeases} from "../../lib/db/users/userLease";
import LeaseForm from "../../components/leaseForm";
import {GetDynamicContent} from "../../lib/db/content/dynamicContent";
import {GetTenantBulkEmails} from "../../lib/db/users/bulkEmail";
import {GetUserDeletedPayments, GetUserPayments} from "../../lib/db/users/userPayment";
import {UserApartment} from "../../components/assignments";
import * as Constants from "../../lib/constants";
import GenericExplanationModal from "../../components/genericExplanationModal";
import {useForm} from "react-hook-form";
import NewApplicationForm from "../../components/newApplicationForm";
import UsernameForm from "../../components/usernameForm";
import PasswordForm from "../../components/passwordForm";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Tenant = ({
                    isTenant, site, navPage, links, user, tenant, currentLeasesMap,
                    applications, userId, leases, leaseContentMap, deletedPayments,
                    emails, applicationContent, payments, roommates, tab, currentLeases, page,
                    rules, previous_rental, esa_packet, disclaimer, guaranty
                    , ...restOfProps
                }) => {
    const roommateSemesters = roommates.map(it => it.semester).reduce(function (acc, curr) {
        if (!acc.includes(curr))
            acc.push(curr);
        return acc;
    }, []);

    const [validPayments, setvalidPayments] = useState(payments);
    const [validDeletedPayments, setvalidDeletedPayments] = useState(deletedPayments);
    const [paymentError, setPaymentError] = useState();
    const [deleteData, setDeleteData] = useState({show: false, description: null});
    const [userInfoError, setUserInfoError] = useState();
    const [userInfoSuccess, setUserInfoSuccess] = useState();


    tab = (tab === "Roommates") ? 3 : 0;

    useEffect(() => {
        async function process() {
            try {
                const options = {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id: deleteData.paymentId, reason: deleteData.description}),
                }

                const resp = await fetch(`/api/users/${user.id}/payment?site=${site}`, options)
                switch (resp.status) {
                    case 204:
                    case 200:
                        const payment = {
                            ...(validPayments.find(payment => payment.id === deleteData.paymentId)),
                            reason_deleted: deleteData.description,
                            date_deleted: new Date().toLocaleDateString()
                        };
                        setvalidPayments(validPayments.filter(payment => payment.id !== deleteData.paymentId));
                        setvalidDeletedPayments([...validDeletedPayments, payment]);
                        break;
                    case 400:
                    default:
                        setPaymentError("There was an error removing this payment. Please try again.");
                        break;
                }
            } catch (e) {
                setPaymentError("There was an error removing this payment. Please try again.");
                console.error(new Date().toISOString() + " - " +e);
            }
        }

        if (deleteData.description && deleteData.paymentId) {
            process();
        }
    }, [deleteData.description]); // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <Layout site={site} user={user} wide={!isTenant}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        <Tabs defaultActiveKey={tab}>
                            <Tab title="Personal Info" eventKey={0} key={0}>
                                <TenantForm tenant={tenant} site={site} userId={userId}/>
                            </Tab>
                            <Tab title="Applications" eventKey={1} key={1}>
                                <Tabs>
                                    {applications.map(application => {
                                        const currentLeases = currentLeasesMap.find(record => application.lease_id === record.leaseId).currentLeases;
                                        return (
                                            <Tab title={`${application.label}`}
                                                 eventKey={`${application.lease_id}_${application.room_type_id}`}
                                                 key={`${application.lease_id}_${application.room_type_id}`}>
                                                <ApplicationForm application={application}
                                                                 site={site}
                                                                 userId={userId}
                                                                 leaseId={application.lease_id}
                                                                 navPage={navPage}
                                                                 roomTypeId={application.room_type_id}
                                                                 currentLeases={currentLeases}
                                                                 isTenant={isTenant}
                                                                 {...applicationContent} />
                                            </Tab>);
                                    })}
                                    {currentLeases.length > 0 &&
                                        <Tab title="New Application"
                                             eventKey="new"
                                             key="new">
                                            <NewApplicationForm site={site}
                                                                tenant={tenant}
                                                                page={page}
                                                                userId={userId}
                                                                user={user}
                                                                canEdit={false}
                                                                disclaimer={disclaimer}
                                                                currentLeases={currentLeases}
                                                                esa_packet={esa_packet}
                                                                guaranty={guaranty}
                                                                rules={rules}
                                                                previous_rental={previous_rental}/>

                                        </Tab>
                                    }
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
                            {roommateSemesters.length > 0 &&
                                <Tab title="Roommates" eventKey={3} key={3}>
                                    <Tabs>
                                        {
                                            roommateSemesters.map(sem =>
                                                <Tab title={sem} eventKey={sem.replace(" ", "_")}
                                                     key={sem.replace(" ", "_")}>
                                                    {
                                                        <UserApartment
                                                            data={roommates.filter(tenant => sem === tenant.semester)}/>
                                                    }
                                                </Tab>)
                                        }
                                    </Tabs>
                                </Tab>
                            }
                            {payments?.length > 0 &&
                                <Tab title="Payments" eventKey={4} key={4}>
                                    {paymentError &&
                                        <Alert dismissible onClose={() => setPaymentError(null)} variant={"danger"}
                                               onClick={() => setPaymentError(null)}>{paymentError}</Alert>
                                    }
                                    {!isTenant &&
                                        <GenericExplanationModal data={deleteData}
                                                                 accept={(description) => setDeleteData({
                                                                     ...deleteData,
                                                                     show: false,
                                                                     description: description
                                                                 })} close={() => setDeleteData({
                                            ...deleteData,
                                            show: false
                                        })}></GenericExplanationModal>
                                    }
                                    <Table>
                                        <thead>
                                        <tr>
                                            <th>Trans ID</th>
                                            <th>Date</th>
                                            <th>Location</th>
                                            <th>Amount</th>
                                            <th>Type</th>
                                            <th>Number</th>
                                            <th>Description</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {validPayments.map(row => (
                                            <tr>
                                                <td>{row.trans_id}</td>
                                                <td>{row.date}</td>
                                                <td>{Constants.locations[row.location]}</td>
                                                <td>{row.amount}</td>
                                                <td>{row.account_type}</td>
                                                <td>{row.account_number}</td>
                                                <td>{row.description}</td>
                                                <td><Button onClick={() => setDeleteData({
                                                    show: true,
                                                    paymentId: row.id
                                                })}>Delete</Button></td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Tab>
                            }
                            {!isTenant && validDeletedPayments?.length > 0 &&
                                <Tab title="Deleted Payments" eventKey={5} key={5}>
                                    <Table>
                                        <thead>
                                        <tr>
                                            <th>Trans ID</th>
                                            <th>Date Deleted</th>
                                            <th>Amount</th>
                                            <th>Type</th>
                                            <th>Number</th>
                                            <th>Reason</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {validDeletedPayments.map(row => (
                                            <tr>
                                                <td>{row.trans_id}</td>
                                                <td>{row.date_deleted}</td>
                                                <td>{row.amount}</td>
                                                <td>{row.account_type}</td>
                                                <td>{row.account_number}</td>
                                                <td>{row.reason_deleted}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </Tab>
                            }
                            {!isTenant &&
                                <Tab title="Bulk Emails" eventKey={6} key={6}>
                                    <Tabs>
                                        {emails.map(email =>
                                            <Tab title={email.semester} eventKey={email.semester?.replace(" ", "_")}
                                                 key={email.semester?.replace(" ", "_")}>
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
                            {!isTenant &&
                                <Tab title="User Information" eventKey={7} key={7}>
                                    {userInfoError &&
                                        <Alert variant={"danger"} dismissible
                                               onClick={() => setUserInfoError(null)}>{userInfoError}</Alert>
                                    }
                                    {userInfoSuccess &&
                                        <Alert variant={"success"} dismissible
                                               onClick={() => setUserInfoSuccess(null)}>{userInfoSuccess}</Alert>
                                    }
                                    <div className="h4">{`Username: ${tenant.username}`}</div>
                                    <br/>
                                    <UsernameForm site={site} userId={userId} username={tenant.username} setUserInfoError={setUserInfoError} setUserInfoSuccess={setUserInfoSuccess}/>
                                    <PasswordForm site={site} userId={userId} admin={user.manageApartment} username={tenant.username} setUserInfoError={setUserInfoError} setUserInfoSuccess={setUserInfoSuccess}/>
                                </Tab>
                            }
                        </Tabs>
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
    const {userId} = context.query;
    const site = context.query.site || SITE;
    const user = context.req.session.user;
    const isTenant = !user?.manageApartment;
    const navPage = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, isTenant ? "/" : "");
    let applicationContent = {};
    const page = "application";

    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: `/application?site=${site}`});
        context.res.end();
        return {};
    }
    const [nav,
        tenant,
        applications,
        leases,
        emails,
        applicationContentRows,
        payments,
        deletedPayments,
        roommates,
        currentRooms] = await Promise.all(
        [
            GetNavLinks(user, site),
            GetTenant(site, userId),
            GetTenantApplications(site, userId),
            GetTenantUserLeases(site, userId),
            GetTenantBulkEmails(site, userId),
            GetDynamicContent(site, page),
            GetUserPayments(site, userId),
            GetUserDeletedPayments(site, userId),
            user && user.isLoggedIn ? GetUserRoomates(userId) : [],
            GetUserAvailableLeaseRooms(site, userId),
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
    let currentLeases = [...new Set(currentRooms.map(room => room.lease_id))];
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
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
            page: page,
            userId: userId,
            currentLeasesMap: currentLeasesMap,
            currentLeases: currentLeases,
            leases: leases,
            leaseContentMap: leaseContentMap,
            emails: emails,
            applicationContent: applicationContent,
            payments: payments,
            deletedPayments: deletedPayments,
            roommates: roommates,
            tab: context.query.tab || null
        }
    };
}, ironOptions);

export default Tenant;
