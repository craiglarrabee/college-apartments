import Layout from "../components/layout";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("../components/navigation"), { ssr: false });
import {isBot} from "../lib/bots";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {Alert, Button, Col, Form, Row, Tab, Table, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {GetUserPayments} from "../lib/db/users/userPayment";
import {GetTenant} from "../lib/db/users/tenant";
import {useForm} from "react-hook-form";
import GenericModal from "../components/genericModal";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import ReceiptModal from "../components/receiptModal";
import Link from "next/link";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import AcknowledgePaymentModal from "../components/acknowledgePaymentModal";
import {PaymentLineItems} from "../components/paymentLineItems";
import {GetTenantPaymentItems} from "../lib/db/users/tenantPaymentItems";

const SITE = process.env.SITE;
const bg = process.env.BG || 'light';
const variant = process.env.VARIANT || 'light';
const brandUrl = process.env.BRAND_URL || 'http://www.utahcollegeapartments.com';


const Payments = ({site, isABot,  navPage, links, user, payments, tenant, privacyContent, refundContent, tenantPaymentItems, ...restOfProps}) => {
    const {
        register,
        resetField,
        formState: {isValid, isDirty, errors},
        handleSubmit
    } = useForm({mode: "all"});

    const [paymentError, setPaymentError] = useState();
    const [paymentInfo, setPaymentInfo] = useState();
    const [validPayments, setvalidPayments] = useState(payments);
    const [cardNumber, setCardNumber] = useState("");
    const [expDate, setExpDate] = useState("");
    const [code, setCode] = useState("");
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showRefund, setShowRefund] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [aptLocation, setAptLocation] = useState(site === "snow" ? "pp" : "");
    const [selectedPrivacyContent, setSelectedPrivacyContent] = useState(privacyContent[aptLocation]);
    const [payment, setPayment] = useState("");
    const [paymentItems, setPaymentItems] = useState([{id: 0, description: "", amount: "", surcharge: "", unitPrice: ""}]);
    const [total, setTotal] = useState("");
    const [adminItemIds, setAdminItemIds] = useState([]); // Track which items came from admin
    const [isLoading, setIsLoading] = useState(false);
    const payButtonRef = React.useRef(null); // Reference to the Pay button

    // Feature flag: enable Square for snow site via NEXT_PUBLIC_USE_SQUARE_FOR_SNOW
    const [useSquare, setUseSquare] = useState(false);
    const [squarePayments, setSquarePayments] = useState(null);
    const [squareCard, setSquareCard] = useState(null);
    // UI banner to indicate which payment mode is active
    const [showModeBanner, setShowModeBanner] = useState(true);

    // Auto-populate payment items from admin-created entries
    useEffect(() => {
        console.log('tenantPaymentItems received:', tenantPaymentItems);
        if (tenantPaymentItems && tenantPaymentItems.length > 0) {
            const getSurcharge = (amt) => {
                if (site === "snow") {
                    return Math.round(amt * 2.75) / 100;
                }
                return 0;
            };

            const items = tenantPaymentItems.map((item, index) => {
                const amount = parseFloat(item.amount);
                const surcharge = getSurcharge(amount);
                const unitPrice = amount + surcharge;

                return {
                    id: index,
                    description: item.description,
                    amount: amount.toString(),
                    surcharge: surcharge.toString(),
                    unitPrice: unitPrice.toString(),
                    adminItemId: item.id, // Store the DB ID for later
                    isAdminCreated: true // Mark as admin-created
                };
            });

            console.log('Setting payment items:', items);
            setPaymentItems(items);
            setAdminItemIds(items.map(i => i.adminItemId));

            // Calculate total
            const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.unitPrice), 0);
            const currency = Intl.NumberFormat("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2});
            setTotal(currency.format(totalAmount));

            if (items.length > 0) {
                setPaymentInfo("You have pending payment items set by the administrator. Please review and complete your payment.");
            }
        }
    }, [tenantPaymentItems, site]);

    useEffect(() => {
        // Single toggle passed from server via props to avoid client env mismatch
        const flag = !!restOfProps.useSquareEnabled && site === 'snow';
        setUseSquare(flag);
    }, [site, restOfProps.useSquareEnabled]);

    useEffect(() => {
        if (!useSquare) return;
        // Load Square Web Payments SDK and initialize card element
        const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || (process.env.NODE_ENV !== 'production' ? process.env.TEST_SQUARE_LOCATION_ID : undefined);
        if (!applicationId || !locationId) return;

        const ensureScript = () => new Promise((resolve, reject) => {
            if (window.Square) return resolve();
            const script = document.createElement('script');
            script.src = (process.env.NODE_ENV === 'production')
                ? 'https://web.squarecdn.com/v1/square.js'
                : 'https://sandbox.web.squarecdn.com/v1/square.js';
            script.onload = () => resolve();
            script.onerror = (e) => reject(e);
            document.body.appendChild(script);
        });

        (async () => {
            try {
                await ensureScript();
                const payments = window.Square.payments(applicationId, locationId);
                setSquarePayments(payments);
                // Card element will include postal code by default
                const card = await payments.card({
                    style: {
                        '.input-container.is-focus': {
                            borderColor: '#5FAFD2'
                        },
                        '.message-text': {
                            color: '#dc3545'
                        }
                    }
                });
                await card.attach('#sq-card-container');
                setSquareCard(card);
            } catch (e) {
                console.error(`${new Date().toISOString()} - Failed to init Square`, e);
                setPaymentError('Failed to initialize card input. Please refresh and try again.');
            }
        })();
    }, [useSquare]);

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
    };

    const changeLocation = (event) => {
        setAptLocation(event.currentTarget.value);
        setSelectedPrivacyContent(privacyContent[event.currentTarget.value]);
    };

    const submitForm = async (data, event) => {
        event.preventDefault();
        data.total = total.replaceAll(",", "").replace("$", "");
        data.email = tenant.email;
        data.tenantFirstName = tenant.first_name;
        data.tenantLastName = tenant.last_name;
        data.items = paymentItems;

        // Include admin item IDs if any items came from admin
        data.adminItemIds = paymentItems
            .filter(item => item.adminItemId)
            .map(item => item.adminItemId);

        // now store form data for use after confirmation
        setPayment({...data, date: new Date().toLocaleDateString()});
    };

    useEffect(() => {
        // now show confirmation dialog
        if (payment.total)
            setShowConfirmation(true);
    }, [payment]);

    const makePayment = async () => {
        setIsLoading(true);
        try {
            let body = { ...payment };

            // If using Square, tokenize to get squareSourceId and strip raw CC fields
            if (useSquare) {
                if (!squareCard) {
                    setPaymentError('Payment form is not ready. Please refresh and try again.');
                    setIsLoading(false);
                    return;
                }
                // Tokenize the card - Square's card element collects card number, expiration, CVV, and postal code
                const result = await squareCard.tokenize();
                if (result?.status !== 'OK') {
                    const errorMessage = result?.errors?.[0]?.message || 'Unable to tokenize card. Please verify your entries and try again.';
                    setPaymentError(errorMessage);
                    console.error('Square tokenization error:', result);
                    setIsLoading(false);
                    return;
                }
                body.squareSourceId = result.token;

                // Extract postal code from tokenization result if available
                if (result?.details?.billing?.postalCode) {
                    body.zip = result.details.billing.postalCode;
                }

                delete body.cc_number;
                delete body.cc_expire;
                delete body.cc_code;
            }

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            }

            const resp = await fetch(`/api/users/${user.id}/payment?site=${site}`, options)
            switch (resp.status) {
                case 204:
                case 200:
                    setvalidPayments([...validPayments,
                            {
                                date: new Date().toLocaleDateString(),
                                user_id: user.id,
                                amount: payment.amount,
                                surcharge: payment.surcharge,
                                total: payment.total,
                                location: payment.location
                            }
                        ]
                    );
                    setShowReceipt(true);
                    break;
                case 400:
                default:
                    let errorMessage = "There was an error processing your payment.";
                    try {
                        const errorData = await resp.json();
                        if (errorData && errorData.message) {
                            errorMessage = `There was an error processing your payment: ${errorData.message}`;
                        } else if (errorData && errorData.description) {
                            errorMessage = `There was an error processing your payment: ${errorData.description}`;
                        }
                    } catch (jsonError) {
                        // If JSON parsing fails, use the default error message
                        console.error(`${new Date().toISOString()} - Failed to parse error response:`, jsonError);
                    }
                    setPaymentError(errorMessage);
                    setIsLoading(false);
                    break;
            }
        } catch (e) {
            setPaymentError("There was an error processing your payment.");
            console.error(`${new Date().toISOString()} -` , e);
            setIsLoading(false);
        }
    };

    return (
        <Layout site={site} user={user} wide={false}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <GenericModal content={selectedPrivacyContent} close={() => setShowPrivacy(false)}
                                  show={showPrivacy}/>
                    <GenericModal content={refundContent} close={() => setShowRefund(false)} show={showRefund}/>
                    <ReceiptModal content={payment} site={site} close={() => {
                        location = `/index?site=${site}`;
                        setShowReceipt(false);
                    }} show={showReceipt}/>
                    <AcknowledgePaymentModal
                        content={payment}
                        acknowledge={async () => {
                            setShowConfirmation(false);
                            await makePayment();
                        }}
                        site={site} close={() => setShowConfirmation(false)}
                        show={showConfirmation}/>

                    <div className={classNames("main-content")}>
                        {paymentInfo &&
                            <Alert dismissible={true} variant={"warning"}
                                   onClick={() => setPaymentInfo(null)}>{paymentInfo}</Alert>
                        }
                        {site === "snow" &&
                            <Alert>All payments made with a credit/debit card will be charged a 2.75% processing fee.
                                To avoid any fees, you may make payments with cash or check. If you intend on mailing a
                                check, please allow enough time for payment to arrive before the due date.
                                Please feel free to contact the office if you have any questions or concerns.
                            </Alert>
                        }
                        <Tabs defaultActiveKey={0}>
                            <Tab title="Make a payment" eventKey={0} key={0}>
                                <div style={{
                                    marginTop: "30px",
                                    display: "grid"
                                }}>
                                    {paymentError &&
                                        <Alert dismissible={true} variant={"danger"}
                                               onClick={() => setPaymentError(null)}>{paymentError} Please verify your
                                            data and try again or {<Link
                                                href={`/contact?site=${site}`}>Contact
                                                us</Link>} </Alert>
                                    }
                                    <Form onSubmit={handleSubmit(submitForm)} method="post">
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
                                                    className={errors && errors.state && classNames("border-danger")}
                                                    {...register("state", {
                                                        required: {
                                                            value: true,
                                                            message: "State is required."
                                                        }
                                                    })}
                                                    type="text"
                                                    placeholder="State"
                                                    defaultValue="">
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
                                            {!useSquare && (
                                                <Form.Group as={Col} className="mb-3" controlId="zip">
                                                    <Form.Label className="required">Zip Code</Form.Label>
                                                    <Form.Control
                                                        className={errors && errors.zip && classNames("border-danger")}
                                                        {...register("zip", {
                                                            required: {
                                                                value: true,
                                                                message: "Zip/Postal Code is required."
                                                            }
                                                        })}
                                                        type="text"
                                                        placeholder="Zip Code"
                                                    />
                                                    {errors && errors.zip &&
                                                        <Form.Text
                                                            className={classNames("text-danger")}>{errors && errors.zip.message}</Form.Text>}
                                                </Form.Group>
                                            )}
                                        </Row>
                                        <hr/>
                                        {useSquare && (
                                            <>
                                                <Form.Text>Card Information</Form.Text>
                                                <Row>
                                                    <Col xs={12} className="mb-3">
                                                        <div id="sq-card-container" style={{border: '1px solid #ced4da', borderRadius: 4, padding: 12}} />
                                                        <Form.Text className="text-muted">Your card details are securely handled by Square.</Form.Text>
                                                        {/* Hidden element to catch tab focus after Square card and redirect to Pay button if admin items exist */}
                                                        <input
                                                            type="text"
                                                            tabIndex={0}
                                                            onFocus={(e) => {
                                                                const allAdminCreated = paymentItems.length > 0 && paymentItems.every(item => item.isAdminCreated);
                                                                if (allAdminCreated && payButtonRef.current) {
                                                                    e.preventDefault();
                                                                    payButtonRef.current.focus();
                                                                }
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                left: '-9999px',
                                                                width: '1px',
                                                                height: '1px',
                                                                opacity: 0
                                                            }}
                                                            aria-hidden="true"
                                                        />
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                        {!useSquare && (
                                            <>
                                                <Form.Text>Credit Card Information</Form.Text>
                                                <Row>
                                            <Form.Group as={Col} xs={5} className="mb-3" controlId="cc_number">
                                                <Form.Label className="required">Card Number</Form.Label>
                                                <Form.Control maxLength={19} autoComplete="cc-number"
                                                              className={errors && errors.cc_number && classNames("border-danger")} {...register("cc_number", {
                                                        pattern: {
                                                            value: /\d{4} \d{4} \d{4} \d{3,4}/,
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
                                                <Form.Control maxLength={7} autoComplete="cc-exp"
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
                                                <Form.Label className="required">CCV</Form.Label>
                                                <Form.Control maxLength={4}
                                                              className={errors && errors.cc_code && classNames("border-danger")} {...register("cc_code", {
                                                    pattern: {
                                                        value: /\d{3,4}/,
                                                        message: "A Valid CCV is required."
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
                                            </>
                                        )}
                                        <hr/>
                                        <Form.Text>Items</Form.Text>
                                            <PaymentLineItems
                                                site={site}
                                                register={register}
                                                errors={errors}
                                                resetField={resetField}
                                                paymentItems={paymentItems}
                                                setParentPaymentItems={setPaymentItems}
                                                setParentTotal={setTotal}
                                            />
                                        <hr/>
                                        <Row>
                                            {site === "suu" ?
                                                <>
                                                    <Form.Label as={Col} xs={2}
                                                                className="required">Location</Form.Label>
                                                    <Form.Group as={Col} xs={4} className="mb-3" controlId="location">
                                                        <Form.Select
                                                            className={errors && errors.location && classNames("border-danger")} {...register("location", {
                                                            required: {
                                                                value: true,
                                                                message: "Please select the location you are making a payment for."
                                                            }
                                                        })} onChange={changeLocation} value={aptLocation}>
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
                                                                      value={aptLocation} {...register("location")} />
                                                    </Form.Group>
                                                </>
                                            }
                                        </Row>
                                        <br/>
                                        <Row>
                                            {aptLocation &&
                                                <div className="align-content-center">
                                                    {site === "suu" ? (
                                                        <>
                                                            <div className="d-flex align-items-center mb-3">
                                                                <span className="required me-1"></span>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    id="agreeToPolicies"
                                                                    label={
                                                                        <span>
                                                                            I have read and agree to the{" "}
                                                                            <Button variant="link" size="sm" className="p-0 vertical-align-baseline" onClick={() => setShowPrivacy(true)}>privacy policy</Button>
                                                                            {" "}and the{" "}
                                                                            <Button variant="link" size="sm" className="p-0 vertical-align-baseline" onClick={() => setShowRefund(true)}>refund policy</Button>.
                                                                        </span>
                                                                    }
                                                                    {...register("agreeToPolicies", {
                                                                        required: "You must agree to the privacy and refund policies to continue."
                                                                    })}
                                                                    isInvalid={!!errors.agreeToPolicies}
                                                                />
                                                            </div>
                                                            {errors.agreeToPolicies && (
                                                                <div className="text-danger small mt-n2 mb-3 px-2">
                                                                    {errors.agreeToPolicies.message}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
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
                                                    )}
                                                </div>
                                            }
                                        </Row>
                                        {paymentError &&
                                            <Alert dismissible={true} variant={"danger"}
                                                   onClick={() => setPaymentError(null)}>{paymentError} Please verify your
                                                data and try again or {<Link
                                                    href={`/contact?site=${site}`}>Contact
                                                    us</Link>} </Alert>
                                        }
                                        {paymentInfo &&
                                            <Alert dismissible={true} variant={"warning"}
                                                   onClick={() => setPaymentInfo(null)}>{paymentInfo}</Alert>
                                        }
                                        <div style={{width: "100%"}}
                                             className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                            <Button
                                                ref={payButtonRef}
                                                variant="primary"
                                                disabled={!isDirty || isLoading}
                                                type="submit"
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
                                        {site === "snow" &&
                                            <>
                                                <th>Amount</th>
                                                <th>Surcharge</th>
                                            </>
                                        }
                                        <th>Total</th>
                                        <th>Description</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {validPayments.map((row, idx) => (
                                        <tr key={row.id ?? `${row.date}-${row.description}-${idx}`}>
                                            <td>{row.date}</td>
                                            {site === "snow" &&
                                                <>
                                                    <td>{row.amount}</td>
                                                    <td>{row.surcharge}</td>
                                                </>
                                            }
                                            <td>{row.total}</td>
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

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
	const site = context.query.site || SITE;
    const user = context.req.session.user;
    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const userId = user.id;
    const [nav, tenant, payments, privacyContent, refundContent, tenantPaymentItems] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(site, userId),
        GetUserPayments(site, userId),
        GetDynamicContent(site, "privacy%"),
        GetDynamicContent(site, "refund"),
        GetTenantPaymentItems(site, userId)
    ]);

    if (!nav.find(page => page.page === "payments")) return {notFound: true};

    let privacy = Object.fromEntries(privacyContent.map(it => {
        return [it.page.replace("privacy-", ""), it.content];
    }));

    let refund = refundContent?.find(content => content.name === "top")?.content;

    return {
        props: {
            site: site,
            links: nav,
            isABot: isBot(context),
            user: {...user},
            payments: payments,
            navPage: "payments",
            tenant: tenant,
            privacyContent: privacy || [],
            refundContent: refund || "",
            useSquareEnabled: process.env.USE_SQUARE_FOR_SNOW === 'true',
            tenantPaymentItems: tenantPaymentItems || []
        }
    };
}, ironOptions);

export default Payments;
