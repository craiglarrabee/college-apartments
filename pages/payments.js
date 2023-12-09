import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Col, Form, Row, Tab, Table, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetUserPayments} from "../lib/db/users/userPayment";
import {GetTenant} from "../lib/db/users/tenant";
import {useForm} from "react-hook-form";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Payments = ({site, navPage, links, user, payments, tenant, ...restOfProps}) => {
    const {
        register,
        reset,
        formState: {isValid, isDirty, errors},
        handleSubmit
    } = useForm();

    const [paymentError, setPaymentError] = useState();
    const [validPayments, setvalidPayments] = useState(payments);

    const makePayment = async (data, event) => {

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${user.id}/payment?site=${site}`, options)
            switch (resp.status) {
                case 204:
                case 200:
                    setvalidPayments([...validPayments,
                            {
                                date: new Date().toLocaleDateString(),
                                user_id: user.id,
                                amount: data.amount,
                                description: data.description
                            }
                        ]
                    );
                    reset();
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
                    <Alert dismissible={true} variant={"danger"}
                           onClick={() => setPaymentError(null)}>{paymentError}</Alert>
                }
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={0}>
                        <Tab title="Make a payment" eventKey={0} key={0}>
                            <div style={{
                                marginTop: "30px",
                                display: "grid"
                            }}>
                                <Form onSubmit={handleSubmit(makePayment)} method="post">
                                    <Row>
                                        <Form.Label as={Col} xs={2} className="required">Description</Form.Label>
                                        <Form.Group as={Col} xs={9} controlId="description">
                                            <Form.Control
                                                className={errors && errors.description && classNames("border-danger")} {...register("description", {
                                                required: {
                                                    value: true,
                                                    message: "Required"
                                                }, maxLength: 250
                                            })} type="text"
                                                placeholder="Reason for payment"/>
                                            {errors && errors.description && <Form.Text
                                                className={classNames("text-danger")}>{errors && errors.description.message}</Form.Text>}
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Label className="required" as={Col} xs={2}>Amount</Form.Label>
                                        <Form.Group as={Col} xs={3} controlId="amount">
                                            <Form.Control
                                                className={errors && errors.amount && classNames("border-danger")} {...register("amount", {
                                                required: {
                                                    value: true,
                                                    message: "Required"
                                                },
                                                maxLength: 10,
                                                pattern: {
                                                    value: /^\d{1,5}\.\d{2}$/,
                                                    message: "Must be a valid amount"
                                                }
                                            })} type="text"
                                                placeholder="Amount of payment"/>
                                            {errors && errors.amount && <Form.Text
                                                className={classNames("text-danger")}>{errors && errors.amount.message}</Form.Text>}
                                        </Form.Group>
                                    </Row>
                                    <Button variant="primary" disabled={!isDirty} type="submit"
                                            style={{margin: "5px"}}>Pay</Button>
                                </Form>
                            </div>
                        </Tab>
                        <Tab title="Payment history" eventKey={1} key={1}>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                {validPayments.map(row => (<tr>
                                    <td>{row.date}</td>
                                    <td>{row.amount}</td>
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
    const [nav, tenant, applications, leases, payments] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(site, userId),
        GetTenantApplications(userId),
        GetTenantUserLeases(userId),
        GetUserPayments(userId)
    ]);
    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            payments: payments,
            navPage: "payments",
            tenant: tenant,
            applications: depositApplications,
            leases: leases
        }
    };
}, ironOptions);

export default Payments;
