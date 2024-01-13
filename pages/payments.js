import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {Alert, Button, Col, Form, Row, Tab, Table, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetUserPayments} from "../lib/db/users/userPayment";
import {GetTenant} from "../lib/db/users/tenant";
import {useForm} from "react-hook-form";
import GenericModal from "../components/genericModal";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import ReceiptModal from "../components/receiptModal";
import Link from "next/link";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;

const locations = {
    cw: "College Way Apartments",
    sw: "Stadium Way Apartments",
    pp: "Park Place Apartments"
}


const Payments = ({site, navPage, links, user, payments, tenant, privacyContent, refundContent, ...restOfProps}) => {
    const {
        register,
        reset,
        formState: {isValid, isDirty, errors},
        handleSubmit
    } = useForm();

    const [paymentError, setPaymentError] = useState();
    const [paymentInfo, setPaymentInfo] = useState();
    const [validPayments, setvalidPayments] = useState(payments);
    const [cardNumber, setCardNumber] = useState("");
    const [expDate, setExpDate] = useState("");
    const [code, setCode] = useState("");
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showRefund, setShowRefund] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [location, setLocation] = useState(site === "snow" ? "pp" : "");
    const [selectedPrivacyContent, setSelectedPrivacyContent] = useState(privacyContent[location]);
    const [amount, setAmount] = useState("");
    const [payment, setPayment] = useState("");

    const formatCardNumber = (event) => {
        let v = event.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        let matches = v.match(/\d{4,16}/g);
        let match = matches && matches[0] || "";
        let parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            setCardNumber(parts.join(" "));
        } else {
            setCardNumber(v);
        }
    };

    const formatExpDate = (event) => {

        if (expDate.length === 3 && event.target.value.length === 2) {
            setExpDate(event.target.value);
            return;
        }
        let v = event.target.value.replace(
            /^([1-9]\/|[2-9])$/g, "0$1/" // 3 > 03/
        ).replace(
            /^(0[1-9]|1[0-2])$/g, "$1/" // 11 > 11/
        ).replace(
            /^([0-1])([3-9])$/g, "0$1/$2" // 13 > 01/3
        ).replace(
            /^(0?[1-9]|1[0-2])([0-9]{2})$/g, "$1/$2" // 141 > 01/41
        ).replace(
            /^([0]+)\/|[0]+$/g, "0" // 0/ > 0 and 00 > 0
        ).replace(
            /[^\d\/]|^[\/]*$/g, "" // To allow only digits and `/`
        ).replace(
            /\/\//g, "/" // Prevent entering more than 1 `/`
        );

        setExpDate(v);
    };

    const formatCode = (event) => {
        setCode(event.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, ""));
    }

    const formatAmount = (event) => {
        if (!event.target.value.includes("."))
            setAmount(`${event.target.value}.00`);
    }

    const changeLocation = (event) => {
        setLocation(event.currentTarget.value);
        setSelectedPrivacyContent(privacyContent[event.currentTarget.value]);
    };

    const makePayment = async (data, event) => {
        event.preventDefault();
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
                                amount: amount,
                                description: data.description,
                                location: locations[data.location]
                            }
                        ]
                    );
                    setPayment({...data, amount: amount, date: new Date().toLocaleDateString(), location: locations[data.location]});
                    setShowReceipt(true);
                    reset();
                    break;
                case 400:
                default:
                    setPaymentError(`There was an error processing your payment: ${resp.body}`)
                    break;
            }
        } catch (e) {
            setPaymentError("There was an error processing your payment.");
            console.log(e);
        }
    };

    return (
        <Layout site={site} user={user} wide={false}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <GenericModal content={selectedPrivacyContent} close={() => setShowPrivacy(false)} show={showPrivacy}/>
                <GenericModal content={refundContent} close={() => setShowRefund(false)} show={showRefund}/>
                <ReceiptModal content={payment} close={() => setShowReceipt(false)} show={showReceipt}/>

                {paymentError &&
                    <Alert dismissible={true} variant={"danger"}
                           onClick={() => setPaymentError(null)}>{paymentError} Please try again or {<Link
                        href="/contact">Contact
                        us</Link>} </Alert>
                }
                {paymentInfo &&
                    <Alert dismissible={true} variant={"primary"}
                           onClick={() => setPaymentInfo(null)}>{paymentInfo}</Alert>
                }
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={0}>
                        <Tab title="Make a payment" eventKey={0} key={0}>
                            <div style={{
                                marginTop: "30px",
                                display: "grid"
                            }}>
                                <Form onSubmit={handleSubmit(makePayment)} method="post">
                                    <Form.Text>Card Holder Information</Form.Text>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3" controlId="first_name">
                                            <Form.Label className="required">First Name</Form.Label>
                                            <Form.Control
                                                className={errors && errors.first_name && classNames("border-danger")} {...register("first_name", {
                                                required: {value: true, message: "First Name is required"},
                                                maxLength: 25
                                            })} type="text" placeholder="First Name"/>
                                            {errors && errors.first_name && <Form.Text
                                                className={classNames("text-danger")}>{errors && errors.first_name.message}</Form.Text>}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="last_name">
                                            <Form.Label className="required">Last Name</Form.Label>
                                            <Form.Control
                                                className={errors && errors.last_name && classNames("border-danger")} {...register("last_name", {
                                                required: {
                                                    value: true,
                                                    message: "Last Name is required."
                                                }
                                            })} type="text" placeholder="Last Name"/>
                                            {errors && errors.last_name && <Form.Text
                                                className={classNames("text-danger")}>{errors && errors.last_name.message}</Form.Text>}
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3" controlId="street">
                                            <Form.Label className="required">Street Address</Form.Label>
                                            <Form.Control
                                                className={errors && errors.street && classNames("border-danger")} {...register("street", {
                                                required: {
                                                    value: true,
                                                    message: "Street Address is required."
                                                }
                                            })} type="text" placeholder="Street Address"/>
                                            {errors && errors.street &&
                                                <Form.Text
                                                    className={classNames("text-danger")}>{errors && errors.street.message}</Form.Text>}
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} xs={6} className="mb-3" controlId="city">
                                            <Form.Label className="required">City</Form.Label>
                                            <Form.Control
                                                className={errors && errors.city && classNames("border-danger")} {...register("city", {
                                                required: {
                                                    value: true,
                                                    message: "City is required."
                                                }
                                            })} type="text" placeholder="City"/>
                                            {errors && errors.city &&
                                                <Form.Text
                                                    className={classNames("text-danger")}>{errors && errors.city.message}</Form.Text>}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="state">
                                            <Form.Label className="required">State</Form.Label>
                                            <Form.Select
                                                className={errors && errors.state && classNames("border-danger")} {...register("state", {
                                                required: {
                                                    value: true,
                                                    message: "State is required."
                                                }
                                            })} type="text" placeholder="State" defaultValue="">
                                                <option value="" disabled>Select State</option>
                                                <option value="AL">Alabama</option>
                                                <option value="AK">Alaska</option>
                                                <option value="AZ">Arizona</option>
                                                <option value="AR">Arkansas</option>
                                                <option value="CA">California</option>
                                                <option value="CO">Colorado</option>
                                                <option value="CT">Connecticut</option>
                                                <option value="DE">Delaware</option>
                                                <option value="DC">District Of Columbia</option>
                                                <option value="FL">Florida</option>
                                                <option value="GA">Georgia</option>
                                                <option value="HI">Hawaii</option>
                                                <option value="ID">Idaho</option>
                                                <option value="IL">Illinois</option>
                                                <option value="IN">Indiana</option>
                                                <option value="IA">Iowa</option>
                                                <option value="KS">Kansas</option>
                                                <option value="KY">Kentucky</option>
                                                <option value="LA">Louisiana</option>
                                                <option value="ME">Maine</option>
                                                <option value="MD">Maryland</option>
                                                <option value="MA">Massachusetts</option>
                                                <option value="MI">Michigan</option>
                                                <option value="MN">Minnesota</option>
                                                <option value="MS">Mississippi</option>
                                                <option value="MO">Missouri</option>
                                                <option value="MT">Montana</option>
                                                <option value="NE">Nebraska</option>
                                                <option value="NV">Nevada</option>
                                                <option value="NH">New Hampshire</option>
                                                <option value="NJ">New Jersey</option>
                                                <option value="NM">New Mexico</option>
                                                <option value="NY">New York</option>
                                                <option value="NC">North Carolina</option>
                                                <option value="ND">North Dakota</option>
                                                <option value="OH">Ohio</option>
                                                <option value="OK">Oklahoma</option>
                                                <option value="OR">Oregon</option>
                                                <option value="PA">Pennsylvania</option>
                                                <option value="RI">Rhode Island</option>
                                                <option value="SC">South Carolina</option>
                                                <option value="SD">South Dakota</option>
                                                <option value="TN">Tennessee</option>
                                                <option value="TX">Texas</option>
                                                <option value="UT">Utah</option>
                                                <option value="VT">Vermont</option>
                                                <option value="VA">Virginia</option>
                                                <option value="WA">Washington</option>
                                                <option value="WV">West Virginia</option>
                                                <option value="WI">Wisconsin</option>
                                                <option value="WY">Wyoming</option>
                                                <option value="AS">American Samoa</option>
                                                <option value="GU">Guam</option>
                                                <option value="MP">Northern Mariana Islands</option>
                                                <option value="PR">Puerto Rico</option>
                                                <option value="UM">United States Minor Outlying Islands</option>
                                                <option value="VI">Virgin Islands</option>
                                                <option value="AA">Armed Forces Americas</option>
                                                <option value="AP">Armed Forces Pacific</option>
                                                <option value="AE">Armed Forces Others</option>
                                            </Form.Select>
                                            {errors && errors.state &&
                                                <Form.Text
                                                    className={classNames("text-danger")}>{errors && errors.state.message}</Form.Text>}
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-3" controlId="zip">
                                            <Form.Label className="required">Zip Code</Form.Label>
                                            <Form.Control
                                                className={errors && errors.zip && classNames("border-danger")} {...register("zip", {
                                                required: {
                                                    value: true,
                                                    message: "Zip/Postal Code is required."
                                                }
                                            })} type="text" placeholder="Zip Code"/>
                                            {errors && errors.zip &&
                                                <Form.Text
                                                    className={classNames("text-danger")}>{errors && errors.zip.message}</Form.Text>}
                                        </Form.Group>
                                    </Row>
                                    <hr/>
                                    <Form.Text>Credit Card Information</Form.Text>
                                    <Row>
                                        <Form.Group as={Col} xs={5} className="mb-3" controlId="cc_number">
                                            <Form.Label className="required">Card Number</Form.Label>
                                            <Form.Control maxLength={19}
                                                          className={errors && errors.cc_number && classNames("border-danger")} {...register("cc_number", {
                                                    pattern: {
                                                        value: /\d{4} \d{4} \d{4} \d{4}/,
                                                        message: "Valid Card Number is required"
                                                    },
                                                    required: {
                                                        value: true,
                                                        message: "Valid Card Number is required"
                                                    }, onChange: formatCardNumber
                                                }
                                            )} value={cardNumber} type="text"/>
                                            {errors && errors.cc_number && <Form.Text
                                                className={classNames("text-danger")}>{errors && errors.cc_number.message}</Form.Text>}
                                        </Form.Group>
                                        <Form.Group as={Col} xs={3} className="mb-3" controlId="cc_expire">
                                            <Form.Label className="required">Expires</Form.Label>
                                            <Form.Control maxLength={7}
                                                          className={errors && errors.cc_expire && classNames("border-danger")} {...register("cc_expire", {
                                                pattern: {
                                                    value: /\d{2}\/\d{4}/,
                                                    message: "MM/YYYY is required"
                                                },
                                                required: {
                                                    value: true,
                                                    message: "MM/YYYY is required"
                                                }, onChange: formatExpDate
                                            })} value={expDate} type="text"
                                                          placeholder="MM/YYYY"/>
                                            {errors && errors.cc_expire && <Form.Text
                                                className={classNames("text-danger")}>{errors && errors.cc_expire && errors.cc_expire.message}</Form.Text>}
                                        </Form.Group>
                                        <Form.Group as={Col} xs={3} className="mb-3" controlId="cc_code">
                                            <Form.Label className="required">CVV</Form.Label>
                                            <Form.Control maxLength={4}
                                                          className={errors && errors.cc_code && classNames("border-danger")} {...register("cc_code", {
                                                pattern: {
                                                    value: /\d{3,4}/,
                                                    message: "A Valid CVV is required."
                                                },
                                                required: {
                                                    value: true,
                                                    message: "A Valid CVV is required."
                                                }, onChange: formatCode
                                            })} value={code} type="text"/>
                                            {errors && errors.cc_code &&
                                                <Form.Text
                                                    className={classNames("text-danger")}>{errors && errors.cc_code.message}</Form.Text>}
                                        </Form.Group>
                                    </Row>
                                    <hr/>
                                    <Form.Text>Payment Information</Form.Text>
                                    <Row>
                                        {site === "suu" ?
                                            <>
                                                <Form.Label as={Col} xs={2} className="required">Location</Form.Label>
                                                <Form.Group as={Col} xs={4} className="mb-3" controlId="location">
                                                    <Form.Select
                                                        className={errors && errors.location && classNames("border-danger")} {...register("location", {
                                                        required: {
                                                            value: true,
                                                            message: "Please select the location you are making a payment for."
                                                        }
                                                    })} onChange={changeLocation} value={location}>
                                                        <option value="" disabled={true}>Location
                                                        </option>
                                                        <option value="cw">College Way</option>
                                                        <option value="sw">Stadium Way</option>
                                                    </Form.Select>
                                                    {errors && errors.location && <Form.Text
                                                        className={classNames("text-danger")}>{errors && errors.location.message}</Form.Text>}
                                                </Form.Group>
                                            </> :
                                            <>
                                                <Form.Group as={Col} xs={4} className="mb-3" controlId="location">
                                                    <Form.Control as="input" type="hidden"
                                                                  value={location} {...register("location")} />
                                                </Form.Group>
                                            </>
                                        }
                                    </Row>
                                    <Row>
                                        <Form.Label as={Col} xs={2}
                                                    className="required">Description</Form.Label>
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
                                        <Form.Group as={Col} xs={4} controlId="amount">
                                            <Form.Control
                                                className={errors && errors.amount && classNames("border-danger")} {...register("amount", {
                                                pattern: {
                                                    value: /^[1-9]\d{0,4}\.{0,1}\d{0,2}$/,
                                                    message: "Must be a valid amount between $1.00 and $99999.99"
                                                },
                                                required: {
                                                    value: true,
                                                    message: "Must be a valid amount between $1.00 and $99999.99"
                                                },
                                                onChange: (event) => setAmount(event.target.value),
                                                onBlur: formatAmount
                                            })} type="text"
                                                value={amount}
                                                placeholder="Amount of payment"/>
                                            {errors && errors.amount && <Form.Text
                                                className={classNames("text-danger")}>{errors && errors.amount.message}</Form.Text>}
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        {location &&
                                            <div className="align-content-center">
                                                <Form.Text>With your payment, you agree to our
                                                    <Button style={{
                                                        paddingTop: "0px",
                                                        paddingBottom: "8px",
                                                        paddingLeft: "2px",
                                                        paddingRight: "2px"
                                                    }} variant={"link"} onClick={() => setShowPrivacy(true)}>privacy
                                                        policy </Button>
                                                    and our
                                                    <Button style={{
                                                        paddingTop: "0px",
                                                        paddingBottom: "8px",
                                                        paddingLeft: "2px"
                                                    }} variant={"link"} onClick={() => setShowRefund(true)}>refund
                                                        policy </Button>
                                                </Form.Text>
                                            </div>
                                        }
                                    </Row>
                                    <div style={{width: "100%"}}
                                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                        <Button variant="primary" disabled={!isDirty} type="submit"
                                                style={{margin: "5px"}}>Pay</Button>
                                    </div>
                                </Form>
                            </div>
                        </Tab>
                        <Tab title="Payment history" eventKey={1} key={1}>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                </tr>
                                </thead>
                                <tbody>
                                {validPayments.map(row => (
                                    <tr>
                                        <td>{row.date}</td>
                                        <td>{row.location}</td>
                                        <td>{row.amount}</td>
                                        <td>{row.description}</td>
                                    </tr>
                                ))}
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
    const [nav, tenant, payments, privacyContent, refundContent] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(site, userId),
        GetUserPayments(site, userId),
        GetDynamicContent(site, "privacy%"),
        GetDynamicContent(site, "refund")
    ]);

    let privacy = Object.fromEntries(privacyContent.map(it => {
        return [it.page.replace("privacy-", ""), it.content];
    }));

    let refund = refundContent?.find(content => content.name === "top")?.content;

    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            payments: payments,
            navPage: "payments",
            tenant: tenant,
            privacyContent: privacy || [],
            refundContent: refund || ""
        }
    };
}, ironOptions);

export default Payments;
