import {Button, Col, Form, Row} from "react-bootstrap";
import classNames from "classnames";
import React, {useEffect, useState} from "react";

export const VerifyEmail = ({
                                setOrigEmail,
                                hasEmailChanged,
                                codeName,
                                site,
                                email,
                                origEmail,
                                setError,
                                errors,
                                emailErrors,
                                register,
                                setValue
                            }) => {
    const [emailVerified, setEmailVerified] = useState(email !== undefined && email !== null && email.length > 0);
    const [emailValidated, setEmailValidated] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [isSendCodeDisabled, setIsSendCodeDisabled] = useState(false);
    const [timerStarted, setTimerStarted] = useState(false);
    const [remainingTime, setRemainingTime] = useState(30);
    const [verificationCode, setVerificationCode] = useState();
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const from = `${site}@uca.snowcollegeapartments.com`;

    useEffect(() => {
        let timer;
        if (timerStarted) {
            setIsSendCodeDisabled(true);
            timer = setInterval(() => {
                setRemainingTime(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        setIsSendCodeDisabled(false);
                        setTimerStarted(false);
                        return 30;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer); // Cleanup the timer on component unmount
    }, [timerStarted]);

    useEffect(() => {
        handleEmailValidation(email);
    }, [email]);

    const handleSendCode = async () => {
        try {
            const payload = {
                from: from,
                email: email,
                subject: `Welcome to ${company}`,
                body: `<b>Email Verification Notification</b><br/><br/>` +
                    `Thank you for registering your email address with ${company}. Below is your email verification code.<br/>` +
                    `<br/>Verification Code: `
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }
            const resp = await fetch(`/api/util/verify-email?site=${site}`, options);
            switch (resp.status) {
                case 204:
                case 200:
                    setVerificationSent(true);
                    setTimerStarted(true);
                    break;
                case 400:
                default:
                    setError("An error occurred sending the verification email. Please verify your email address and try again.");
                    break;
            }
        } catch (e) {
            setError("An error occurred sending the verification email. Please verify your email address and try again.");
            console.error(`${new Date().toISOString()} -` , e);
        }
    };

    const handleVerifyCode = async () => {
        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({verifyCode: verificationCode, email: email}),
            }

            const resp = await fetch(`/api/util/check-verification-code?site=${site}`, options);
            switch (resp.status) {
                case 204:
                    setValue(codeName, "");
                    setVerificationCode("");
                    setEmailVerified(true);
                    setOrigEmail(email);
                    break;
                case 400:
                    setError("Invalid verification code. Please try again.");
                    break;
            }
        } catch (e) {
            setError("An error occurred verifying the code.");
            console.error(`${new Date().toISOString()} -` , e);
        }
    }


    const handleEmailValidation = async (email) => {
        setEmailValidated(email && email.length > 7 && !emailErrors);
        if (hasEmailChanged()) {
            setEmailVerified(false);
            setVerificationSent(false);
        } else {
            setEmailVerified(origEmail?.length > 0);
        }
    }


    return (
        <>
            {!emailVerified && emailValidated && hasEmailChanged() &&
                <Row style={{margin: "3px"}} className={"border-danger border rounded p-2"}>
                    <Form.Text>Please verify your email address.
                        Click {verificationSent ? "Resend" : "Send"}, enter the code from your email and click Verify.</Form.Text>
                    <Form.Group as={Col} xs={3} className="mb-3" controlId="sendVerificationButton">
                        {isSendCodeDisabled ? <Form.Label>Resend in {remainingTime} sec</Form.Label> :
                            <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Form.Label>}
                        <Button disabled={isSendCodeDisabled} variant="primary"
                                onClick={handleSendCode}>{verificationSent ? "Resend" : "Send"}</Button>
                    </Form.Group>
                    <Form.Group as={Col} xs={6} className="mb-3" controlId="emailVerified">
                        <Form.Label className="required">Verify Email</Form.Label>
                        <Form.Control
                            className={errors && errors[codeName] && classNames("border-danger")} {...register(codeName, {
                            required: {value: true, message: "Verification required."},
                            maxLength: 6,
                            minLength: 6,
                            pattern: {
                                value: /^\d{6}$/,
                                message: "Please enter a valid 6 digit verification code"
                            },
                            onChange: (e) => setVerificationCode(e.target.value),
                            onBlur: (e) => setVerificationCode(e.target.value)
                        })} type="text" placeholder="Code"
                        />
                        {errors && errors[codeName] && <Form.Text
                            className={classNames("text-danger")}>{errors && errors[codeName].message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} xs={2} className="mb-3" controlId="emailVerifiedButton">
                        <Form.Label>&nbsp;</Form.Label>
                        <Button disabled={!verificationSent || (errors && errors[codeName])} variant="success" onClick={handleVerifyCode}>Verify</Button>
                    </Form.Group>
                </Row>
            }
        </>
    )
};
