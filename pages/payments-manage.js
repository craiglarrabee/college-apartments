import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {Alert, Button, Table} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetUnreviewedUserPayments} from "../lib/db/users/userPayment";
import * as Constants from "../lib/constants";
import GenericExplanationModal from "../components/genericExplanationModal";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Payments = ({site, navPage, links, user, payments, ...restOfProps}) => {
    const [paymentError, setPaymentError] = useState();
    const [validPayments, setvalidPayments] = useState(payments);
    const [deleteData, setDeleteData] = useState({show: false});

    const markPaymentReviewed = async (paymentId) => {

        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: paymentId}),
            }

            const resp = await fetch(`/api/users/${user.id}/payment?site=${site}`, options)
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
            console.error(e);
        }
    };

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
                        ;
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
                console.error(e);
            }
        }

        if (deleteData.description && deleteData.paymentId) {
            process();
        }

    }, [deleteData.description]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    {paymentError &&
                        <Alert dismissible onClose={() => setPaymentError(null)} variant={"danger"}
                               onClick={() => setPaymentError(null)}>{paymentError}</Alert>
                    }
                    <GenericExplanationModal data={deleteData} accept={(description) => setDeleteData({
                        ...deleteData,
                        show: false,
                        description: description
                    })} close={() => setDeleteData({...deleteData, show: false})}></GenericExplanationModal>
                    <div className={classNames("main-content")}>
                        <Table>
                            <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Trans ID</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Number</th>
                                <th>Description</th>
                                <th></th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {validPayments.map(row => (
                                <tr>
                                    <td><a href={`/tenants/${row.user_id}?site=${site}`}>{row.tenant_name}</a></td>
                                    <td>{row.trans_id}</td>
                                    <td>{row.date}</td>
                                    <td>{Constants.locations[row.location]}</td>
                                    <td>{row.amount}</td>
                                    <td>{row.account_type}</td>
                                    <td>{row.account_number}</td>
                                    <td>{row.description}</td>
                                    <td><Button onClick={() => markPaymentReviewed(row.id)}>Reviewed</Button></td>
                                    <td><Button
                                        onClick={() => setDeleteData({show: true, paymentId: row.id})}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const site = context.query.site || SITE;
    const user = context.req.session.user;
    if (!user?.isLoggedIn || !user?.admin.includes(site) || !user?.manageApartment) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
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
