import {useForm} from "react-hook-form";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {Alert, Button, Col, Form, Row} from "react-bootstrap";
import WorkFormGroups from "./workFormGroups";
import CurrentLeases from "./currentLeases";
import classNames from "classnames";
import ApplicationFormGroups from "./ApplicationFormGroups";
import PageContent from "./pageContent";
import GenericModal from "./genericModal";
import AcknowledgePaymentModal from "./acknowledgePaymentModal";
import {debugLog} from "../lib/util";

const NewApplicationForm = ({
                                site,
                                page,
                                rules,
                                previous_rental,
                                esa_packet,
                                disclaimer,
                                guaranty,
                                canEdit,
                                user,
                                userId,
                                currentLeases,
                                tenant,
                                isReturningStudent,
                                isDepositPaid,
                                isOptional,
                                depositAmount,
                                privacyContent,
                                refundContent,
                                useSquareEnabled,
                                ...restOfProps
                         }) => {

    const router = useRouter();
    const {register, formState: {isValid, isDirty, errors}, handleSubmit, resetField, watch, setValue, trigger} = useForm({
        mode: "all",
        defaultValues: tenant,
        shouldUnregister: true
    });

    useEffect(() => {
        trigger();
    }, [trigger]);
    const [applicationError, setApplicationError] = useState();

    const [dynamicDepositAmount, setDynamicDepositAmount] = useState(depositAmount);

    const watchRoomType = watch(); // Watch all fields to find any lease_X_room_type_id
    
    useEffect(() => {
        // Calculate total deposit amount across all selected rooms/leases
        let totalDeposit = 0;
        let selectionsFound = 0;
        let locations = new Set();
        
        for (const key in watchRoomType) {
            if (key.startsWith("lease_") && key.endsWith("_room_type_id") && watchRoomType[key]) {
                const [leaseId, roomTypeId] = watchRoomType[key].split("_");
                const lease = currentLeases.find(l => l.leaseId.toString() === leaseId);
                if (lease) {
                    const room = lease.rooms.find(r => r.room_type_id.toString() === roomTypeId);
                    if (room && room.deposit_amount !== undefined && room.deposit_amount !== null) {
                        totalDeposit += Number(room.deposit_amount);
                        selectionsFound++;
                        if (room.location) {
                            // Map literal database values to internal codes if necessary
                            let locCode = room.location;
                            if (room.location === "Stadium Way") locCode = "sw";
                            else if (room.location === "College Way") locCode = "cw";
                            else if (room.location === "Park Place") locCode = "pp";
                            locations.add(locCode);
                        }
                    }
                }
            }
        }
        
        if (selectionsFound > 0) {
            setDynamicDepositAmount(totalDeposit);
            // If we found locations in the rooms, set the first one found as the aptLocation
            if (locations.size > 0) {
                setAptLocation(Array.from(locations)[0]);
            }
        } else {
            setDynamicDepositAmount(depositAmount);
        }
    }, [watchRoomType, currentLeases, depositAmount]);

    const depositRequired = !isReturningStudent && !isDepositPaid;

    const currency = Intl.NumberFormat("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2});

    const [cardNumber, setCardNumber] = useState("");
    const [isSquareValid, setIsSquareValid] = useState(false);
    const [squareToken, setSquareToken] = useState(null);
    const [squareZip, setSquareZip] = useState(null);

    useEffect(() => {
        debugLog(`[DEBUG] Application Form State: isValid=${isValid}, isSquareValid=${isSquareValid}, errors=`, errors);
    }, [isValid, errors, isSquareValid]);
    const [expDate, setExpDate] = useState("");
    const [code, setCode] = useState("");
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showRefund, setShowRefund] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [aptLocation, setAptLocation] = useState(site === "snow" ? "pp" : "sw");

    useEffect(() => {
        setValue("location", aptLocation, { shouldValidate: true });
    }, [aptLocation, setValue, site]);

    const [payment, setPayment] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const [useSquare, setUseSquare] = useState(!!useSquareEnabled && site === 'snow');
    const [squarePayments, setSquarePayments] = useState(null);
    const [squareCard, setSquareCard] = useState(null);
    const payButtonRef = useRef(null);

    useEffect(() => {
        const flag = !!useSquareEnabled && site === 'snow';
        setUseSquare(flag);
    }, [site, useSquareEnabled]);

    useEffect(() => {
        if (!useSquare || !depositRequired) {
            setIsSquareValid(false);
            return;
        }

        const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || (process.env.NODE_ENV !== 'production' ? process.env.TEST_SQUARE_LOCATION_ID : undefined);
        if (!applicationId || !locationId) return;

        let active = true;
        let cardInstance = null;

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
                if (!active) return;
                const payments = window.Square.payments(applicationId, locationId);
                if (!active) return;
                setSquarePayments(payments);
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
                if (!active) {
                    await card.destroy();
                    return;
                }
                await card.attach('#sq-card-container');
                
                // Set initial validity state
                if (card.getState) {
                    const initialState = card.getState();
                    setIsSquareValid(initialState?.isCompletelyValid || false);
                }

                card.addEventListener('change', (event) => {
                    const valid = !!event.detail.currentState.isCompletelyValid;
                    setIsSquareValid(valid);
                    setSquareToken(null);
                    debugLog(`[DEBUG] Square card change event: valid=${valid}`);
                    if (valid) {
                        trigger(); // Force re-validation of the whole form
                    }
                });
                cardInstance = card;
                setSquareCard(card);
            } catch (e) {
                console.error(`${new Date().toISOString()} - Failed to init Square`, e);
                setApplicationError('Failed to initialize card input. Please refresh and try again.');
            }
        })();

        return () => {
            active = false;
            if (cardInstance) {
                cardInstance.destroy();
                setSquareCard(null);
            }
        };
    }, [useSquare, depositRequired]);

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
        let v = event.target.value.replace(/^([1-9]\/|[2-9])$/g, "0$1/").replace(/^(0[1-9]|1[0-2])$/g, "$1/").replace(/^([0-1])([3-9])$/g, "0$1/$2").replace(/^(0?[1-9]|1[0-2])([0-9]{2})$/g, "$1/$2").replace(/^([0]+)\/|[0]+$/g, "0").replace(/[^\d\/]|^[\/]*$/g, "").replace(/\/\//g, "/");
        setExpDate(v);
    };

    const formatCode = (event) => {
        setCode(event.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, ""));
    };

    const checkSquareValues = async () => {
        if (!useSquare || !depositRequired) return true;
        if (!squareCard) {
            setApplicationError('Payment form is not ready. Please refresh and try again.');
            return false;
        }

        try {
            const result = await squareCard.tokenize();
            if (result?.status === 'OK') {
                setSquareToken(result.token);
                if (result?.details?.billing?.postalCode) {
                    setSquareZip(result.details.billing.postalCode);
                }
                return true;
            } else {
                const errorMessage = result?.errors?.[0]?.message || 'Please fill in all card details correctly.';
                setApplicationError(errorMessage);
                return false;
            }
        } catch (e) {
            console.error('Error during Square check:', e);
            setApplicationError('An error occurred while verifying card details.');
            return false;
        }
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();

        setIsProcessing(true);
        setApplicationError(null);

        let shouldPay = depositRequired;
        if (isOptional && depositRequired) {
            if (useSquare) {
                shouldPay = isSquareValid;
            } else {
                shouldPay = !!(data.cc_number || data.cc_expire || data.cc_code);
            }
        }

        if (useSquare && shouldPay) {
            const squareOk = await checkSquareValues();
            if (!squareOk) {
                setIsProcessing(false);
                return;
            }
        }

        if (shouldPay) {
            const amount = Number(dynamicDepositAmount);
            const surcharge = site === "snow" ? Math.round(amount * 2.75) / 100 : 0;
            const total = amount + surcharge;

            const paymentData = {
                ...data,
                amount: amount.toString(),
                surcharge: surcharge.toString(),
                total: total.toString(),
                location: aptLocation,
                email: tenant.email,
                tenantFirstName: tenant.first_name,
                tenantLastName: tenant.last_name,
                items: currentLeases.map(lease => {
                    const val = data[`lease_${lease.leaseId}_room_type_id`];
                    if (!val) return null;
                    const [lId, rtId] = val.split("_");
                    const room = lease.rooms.find(r => r.room_type_id.toString() === rtId);
                    if (!room) return null;
                    const itemAmount = Number(room.deposit_amount || 0);
                    const itemSurcharge = site === "snow" ? Math.round(itemAmount * 2.75) / 100 : 0;
                    const itemTotal = itemAmount + itemSurcharge;
                    return {
                        id: lease.leaseId,
                        leaseId: lease.leaseId,
                        description: `Deposit for ${lease.leaseDescription}`,
                        amount: itemAmount.toString(),
                        surcharge: itemSurcharge.toString(),
                        unitPrice: itemTotal.toString()
                    };
                }).filter(item => item !== null),
                date: new Date().toLocaleDateString()
            };
            setPayment(paymentData);
            setShowConfirmation(true);
            return;
        }

        await submitApplication(data);
    };

    const submitApplication = async (data) => {
        data.site = site;
        data.leases = currentLeases.map(lease => {
            let val = data[`lease_${lease.leaseId}_room_type_id`];
            if (!val) return null;
            let ids = val.split("_");
            return {lease_id: ids[0], room_type_id: ids[1]};
        }).filter(lease => !!lease && !!lease.lease_id);
        data.share_info = data.do_not_share_info === "1" ? "0" : "1";
        data.created_by_user_id = user.id;

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/applications?site=${site}`, options)
            switch (resp.status) {
                case 204:
                    await router.push(`/deposit?site=${site}`);
                    return; // Don't fall through to finally if we are redirecting
                default:
                case 400:
                    setApplicationError("There was an error processing your application. Please try again.");
                    break;
            }
        } catch (e) {
            console.error(`${new Date().toISOString()} -` , e);
            setApplicationError("There was an error processing your application. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const processPaymentAndSubmit = async () => {
        setApplicationError(null);
        try {
            let body = { ...payment };

            if (useSquare) {
                if (!squareToken) {
                    setApplicationError('Payment information has changed or is not ready. Please try again.');
                    setIsProcessing(false);
                    return;
                }
                body.squareSourceId = squareToken;
                if (squareZip) {
                    body.zip = squareZip;
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

            const resp = await fetch(`/api/users/${userId}/payment?site=${site}`, options)
            if (resp.status === 200 || resp.status === 204) {
                // Payment successful, now submit the application
                await submitApplication({...payment, depositPaid: true});
            } else {
                let errorMessage = "There was an error processing your payment.";
                try {
                    const errorData = await resp.json();
                    if (errorData && errorData.message) {
                        errorMessage = `There was an error processing your payment: ${errorData.message}`;
                    } else if (errorData && errorData.description) {
                        errorMessage = `There was an error processing your payment: ${errorData.description}`;
                    }
                } catch (jsonError) {
                    console.error(`${new Date().toISOString()} - Failed to parse error response:`, jsonError);
                }
                setApplicationError(errorMessage);
                setIsProcessing(false);
            }
        } catch (e) {
            setApplicationError("There was an error processing your payment.");
            console.error(`${new Date().toISOString()} -` , e);
            setIsProcessing(false);
        }
    };

    return (
        <>
            <GenericModal content={privacyContent?.[aptLocation]} close={() => setShowPrivacy(false)} show={showPrivacy}/>
            <GenericModal content={refundContent} close={() => setShowRefund(false)} show={showRefund}/>
            <AcknowledgePaymentModal
                content={payment}
                acknowledge={async () => {
                    setIsProcessing(true);
                    setShowConfirmation(false);
                    await processPaymentAndSubmit();
                }}
                site={site} close={() => {
                    setShowConfirmation(false);
                    setIsProcessing(false);
                }}
                show={showConfirmation}/>

            <Form onSubmit={handleSubmit(onSubmit)} method="post">
                <Form.Group controlId="email">
                    <Form.Control {...register("email")} type="hidden" value={tenant.email}/>
                </Form.Group>
                {site === "suu" && (
                    <WorkFormGroups canChangeApplication={true} register={register}
                                    errors={errors}/>
                )}
                <div className="h4">Room Type:</div>
                <br/>
                {currentLeases.map(lease => <CurrentLeases key={lease.leaseId} canChangeApplication={true} {...lease} register={register}/>)}
                {errors && errors.lease_room_type_id && <Form.Text className={classNames("text-danger")}>{errors && errors.lease_room_type_id.message}</Form.Text>}
                <ApplicationFormGroups canChangeApplication={true} register={register} errors={errors}
                                       esa_packet={esa_packet} previousRentalLabel={previous_rental}
                                       site={site}
                                       canEdit={canEdit}/>
                <PageContent
                    initialContent={rules}
                    site={site}
                    page={page}
                    name="rules"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={disclaimer}
                    site={site}
                    page={page}
                    name="disclaimer"
                    canEdit={canEdit}/>
                <div className={classNames("mb-3", "d-inline-flex")}>
                    <Form.Check
                        className="mb-3" {...register("installments", {setValueAs: value => value !== null ? value.toString() : ""})}
                        type="checkbox" id="installments" value="1"/>
                    <span>
                                <div>
                                    Check here if you want to pay in installments. <br/>
                                    <PageContent
                                        initialContent={guaranty}
                                        site={site}
                                        page={page}
                                        name="guaranty"
                                        canEdit={canEdit}/>
                                </div>
                            </span>
                </div>

                {depositRequired && (
                    <div className="mt-4 p-3 border rounded">
                        <h4 className="required">Deposit Payment</h4>
                        {site === "suu" && (
                            <Row>
                                <Form.Group as={Col} xs={12} md={6} className="mb-3" controlId="location">
                                    <Form.Label className="required">Payment Location</Form.Label>
                                    <Form.Select
                                        className={errors && errors.location && classNames("border-danger")}
                                        {...register("location", {
                                            required: "Please select the location you are making a payment for."
                                        })}
                                        onChange={(event) => setAptLocation(event.currentTarget.value)}
                                        value={aptLocation}
                                        disabled={true}
                                    >
                                        <option value="" disabled={true}>Select Location</option>
                                        <option value="cw">College Way</option>
                                        <option value="sw">Stadium Way</option>
                                    </Form.Select>
                                    <Form.Text className="text-muted">Location is determined by your room selection.</Form.Text>
                                    {errors && errors.location && <Form.Text className="text-danger">{errors.location.message}</Form.Text>}
                                </Form.Group>
                            </Row>
                        )}
                        <p>{isOptional ? `A deposit of ${currency.format(dynamicDepositAmount)} is optional.` : `A deposit of ${currency.format(dynamicDepositAmount)} is required.`}{site === "snow" && ` A 2.75% processing fee (${currency.format(dynamicDepositAmount * 0.0275)}) will be added for card payments, for a total of ${currency.format(dynamicDepositAmount * 1.0275)}.`}</p>
                        
                        {useSquare ? (
                            <>
                                <Form.Label className={isOptional ? "" : "required"}>Card Information</Form.Label>
                                <Row>
                                    <Col xs={12} className="mb-3">
                                        <div id="sq-card-container" style={{border: '1px solid #ced4da', borderRadius: 4, padding: 12}} />
                                        <Form.Text className="text-muted">Your card details are securely handled by Square.</Form.Text>
                                    </Col>
                                </Row>
                            </>
                        ) : (
                            <>
                                <Form.Label className={isOptional ? "" : "required"}>Credit Card Information</Form.Label>
                                <Row>
                                    <Form.Group as={Col} xs={12} md={6} className="mb-3" controlId="cc_number">
                                        <Form.Label className={isOptional ? "" : "required"}>Card Number</Form.Label>
                                        <Form.Control maxLength={19} autoComplete="cc-number"
                                                      className={errors && errors.cc_number && classNames("border-danger")} {...register("cc_number", {
                                                required: (depositRequired && !isOptional) ? "Card Number is required" : false,
                                                pattern: {
                                                    value: /\d{4} \d{4} \d{4} \d{3,4}/,
                                                    message: "Valid Card Number is required"
                                                },
                                                onChange: formatCardNumber
                                            })} value={cardNumber} type="text"/>
                                        {errors && errors.cc_number && <Form.Text className="text-danger">{errors.cc_number.message}</Form.Text>}
                                    </Form.Group>
                                    <Form.Group as={Col} xs={6} md={3} className="mb-3" controlId="cc_expire">
                                        <Form.Label className={isOptional ? "" : "required"}>Expires</Form.Label>
                                        <Form.Control maxLength={7} autoComplete="cc-exp"
                                                      className={errors && errors.cc_expire && classNames("border-danger")} {...register("cc_expire", {
                                            required: (depositRequired && !isOptional) ? "MM/YYYY is required" : false,
                                            pattern: {
                                                value: /\d{2}\/\d{4}/,
                                                message: "MM/YYYY is required"
                                            },
                                            onChange: formatExpDate
                                        })} value={expDate} type="text" placeholder="MM/YYYY"/>
                                        {errors && errors.cc_expire && <Form.Text className="text-danger">{errors.cc_expire.message}</Form.Text>}
                                    </Form.Group>
                                    <Form.Group as={Col} xs={6} md={3} className="mb-3" controlId="cc_code">
                                        <Form.Label className={isOptional ? "" : "required"}>CCV</Form.Label>
                                        <Form.Control maxLength={4}
                                                      className={errors && errors.cc_code && classNames("border-danger")} {...register("cc_code", {
                                            required: (depositRequired && !isOptional) ? "CVV is required" : false,
                                            pattern: {
                                                value: /\d{3,4}/,
                                                message: "Valid CVV is required"
                                            },
                                            onChange: formatCode
                                        })} value={code} type="text"/>
                                        {errors && errors.cc_code && <Form.Text className="text-danger">{errors.cc_code.message}</Form.Text>}
                                    </Form.Group>
                                </Row>
                            </>
                        )}
                        <Row>
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
                                                    required: (depositRequired && !isOptional) ? "You must agree to the privacy and refund policies to continue." : false
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
                                        <Button variant="link" size="sm" className="p-1" onClick={() => setShowPrivacy(true)}>privacy policy</Button>
                                        and our 
                                        <Button variant="link" size="sm" className="p-1" onClick={() => setShowRefund(true)}>refund policy</Button>
                                    </Form.Text>
                                )}
                            </div>
                        </Row>
                    </div>
                )}

                {applicationError &&
                    <Alert variant={"danger"} dismissible className="mt-3"
                           onClick={() => setApplicationError(null)}>{applicationError}</Alert>
                }
                <div style={{width: "100%"}}
                     className={classNames("mb-3", "justify-content-center", "d-inline-flex", "mt-4")}>
                    <Button variant="primary" type="submit" disabled={canEdit || isProcessing || !isValid}>
                        {isProcessing ? "Processing..." : (depositRequired ? (isOptional ? "Submit Application" : "Pay Deposit and Submit Application") : "Submit")}
                    </Button>
                </div>
            </Form>
        </>
    );
};

export default NewApplicationForm;