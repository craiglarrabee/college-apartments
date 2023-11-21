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
import {GetUserPayments} from "../lib/db/users/userPayment";
import {GetTenant} from "../lib/db/users/tenant";
import {GetTenantApplications} from "../lib/db/users/application";
import {GetTenantUserLeases} from "../lib/db/users/userLease";
import {GetUserRequiredPayments} from "../lib/db/users/userRequiredPayments";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Payments = ({site, navPage, links, user, payments, applications, leases, requiredLeasePayments, tenant, ...restOfProps}) => {
    const [paymentError, setPaymentError] = useState();
    const [validApplications, setValidApplications] = useState(applications);
    const [validPayments, setvalidPayments] = useState(payments);
    const [requiredPayments, setRequiredPayments] = useState(requiredLeasePayments.filter(pmt => !pmt.date));

    const makePayment = async (leaseId, label, amount, type, number) => {

        try {
            const description = type === "payment" ? `${type} ${number} for ${label}` : `${type} for ${label}`;
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({amount: amount, description: description, type: type, payment_number: number}),
            }

            const resp = await fetch(`/api/users/${user.id}/leases/${leaseId}/payment?site=${site}`, options)
            switch (resp.status) {
                case 204:
                case 200:
                    setValidApplications(validApplications.filter(app => app.lease_id !== leaseId));
                    setvalidPayments([...validPayments,
                        {
                            date: new Date().toLocaleDateString(),
                            user_id: user.id,
                            site: site,
                            lease_id: leaseId,
                            amount: amount,
                            type: type,
                            description: description,
                            payment_number: number
                        }]);
                    const newRequiredPayments = requiredPayments.filter(pmt => !(pmt.lease_id == leaseId && pmt.payment_number === number && pmt.payment_type === type));
                    setRequiredPayments(newRequiredPayments);
                    break;
                case 400:
                default:
                    setPaymentError("There was an error processing your payment. Please try again.");
                    break;
            }
        } catch (e) {
            setPaymentError("There was an error processing your payment. Please try again.");
            console.log(e);
        }
    };

    return (
        <Layout site={site} user={user} wide={false}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                {paymentError &&
                    <Alert variant={"danger"} onClick={() => setPaymentError(null)}>{paymentError}</Alert>
                }
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={0}>
                        <Tab title="Make a payment" eventKey={0} key={0}>
                            <div style={{marginTop: "30px", display: "grid", paddingRight: "100px", paddingLeft: "100px"}}>
                                {
                                    requiredPayments.map(pmt =>
                                        <Button style={{marginTop: "10px", marginBottom: "10px"}}
                                                onClick={() => makePayment(pmt.lease_id, pmt.label, pmt.amount, pmt.payment_type, pmt.payment_number)}>
                                            Pay ${pmt.amount} {pmt.payment_type} {pmt.payment_type === "payment" && pmt.payment_number} for {pmt.label}
                                        </Button>
                                    )
                                }
                            </div>
                        </Tab>
                        <Tab title="Payment history" eventKey={1} key={1}>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                {validPayments.map(row => (<tr>
                                    <td>{row.date}</td>
                                    <td>{row.amount}</td>
                                    <td>{row.type}</td>
                                    <td>{row.description}</td>
                                </tr>))}
                                </tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const site = context.query.site || SITE;
    const user = context.req.session.user;
    const userId = user.id;

    if (!user.isLoggedIn) return {notFound: true};
    const [nav, tenant, applications, leases, payments, requiredPayments] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(site, userId),
        GetTenantApplications(userId),
        GetTenantUserLeases(userId),
        GetUserPayments(userId),
        GetUserRequiredPayments(userId)
    ]);
    // only include applications ready for deposit
    const depositApplications = applications.filter(app => app.processed && !app.deposit_date);

    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            payments: payments,
            navPage: "payments",
            tenant: tenant,
            applications: depositApplications,
            leases: leases,
            requiredLeasePayments: requiredPayments
        }
    };
}, ironOptions);

export default Payments;
