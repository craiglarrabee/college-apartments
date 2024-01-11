import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Tab, Table, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetUnreviewedUserPayments, GetUserPayments} from "../lib/db/users/userPayment";
import {GetTenant} from "../lib/db/users/tenant";
import {GetTenantApplications} from "../lib/db/users/application";
import {GetTenantUserLeases} from "../lib/db/users/userLease";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Payments = ({site, navPage, links, user, payments, ...restOfProps}) => {
    const [paymentError, setPaymentError] = useState();
    const [validPayments, setvalidPayments] = useState(payments);

    const markPaymentReviewed = async (paymentId, leaseId) => {

        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: paymentId}),
            }

            const resp = await fetch(`/api/users/${user.id}/leases/${leaseId}/payment?site=${site}`, options)
            switch (resp.status) {
                case 204:
                case 200:
                    setvalidPayments(validPayments.filter(payment => payment.id !== paymentId));
                    break;
                case 400:
                default:
                    setPaymentError("There was an error processing this payment. Please try again.");
                    break;
            }
        } catch (e) {
            setPaymentError("There was an error processing this payment. Please try again.");
            console.log(e);
        }
    };

    return (
        <Layout site={site} user={user} wide={true}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                {paymentError &&
                    <Alert dismissible onClose={() => setPaymentError(null)} variant={"danger"} onClick={() => setPaymentError(null)}>{paymentError}</Alert>
                }
                <div className={classNames("main-content")}>
                    <Table>
                        <thead>
                        <tr>
                            <th>Tenant</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Number</th>
                            <th>Description</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {validPayments.map(row => (<tr>
                            <td><a href={`/tenants/${row.user_id}?site=${site}`} >{row.tenant_name}</a></td>
                            <td>{row.date}</td>
                            <td>{row.amount}</td>
                            <td>{row.type}</td>
                            <td>{row.payment_number}</td>
                            <td>{row.description}</td>
                            <td><Button onClick={() => markPaymentReviewed(row.id, row.lease_id)}>Mark Reviewed</Button></td>
                        </tr>))}
                        </tbody>
                    </Table>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const site = context.query.site || SITE;
    const user = context.req.session.user;
    if (!user?.isLoggedIn || !user?.admin.includes(site) || !user?.manageApartment) return {notFound: true};
    const [nav, payments] = await Promise.all([
        GetNavLinks(user, site),
        GetUnreviewedUserPayments(site),
    ]);

    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            payments: payments,
            navPage: "payments"
        }
    };
}, ironOptions);

export default Payments;