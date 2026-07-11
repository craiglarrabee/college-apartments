import {Alert, Button, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";
import {useForm} from "react-hook-form";
import {useRouter} from "next/router";
import {debugLog} from "../lib/util";

const Login = ({show, close, setNewUser, site, ...restOfProps}) => {
    const [loginError, setLoginError] = useState(false);
    const {register, handleSubmit, formState: {isValid, isDirty}} = useForm({mode: "onChange"});
    const router = useRouter();

    const handleClose = () => {
        setLoginError(false);
        close();
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            const payload = JSON.stringify({...data, site});
            const resp = await fetch(`/api/login?site=${site}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: payload,
            });

            if (!resp.ok) {
                setLoginError(true);
                return;
            }

            const userPayload = await resp.json();
            setLoginError(false);  // Clear error only on success
            setNewUser(userPayload);
            close();
            router.reload();
        } catch (e) {
            console.error(`${new Date().toISOString()} -`, e);
            setLoginError(true);
        }
    };

    // Effect to log when loginError changes
    React.useEffect(() => {
        debugLog('loginError changed to:', loginError);
    }, [loginError]);

    const [isClient, setIsClient] = useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <Modal show={show}
               onHide={handleClose}
               size="lg"
               aria-labelledby="contained-modal-title-vcenter"
               centered
        >
            <Modal.Header closeButton>
                <Modal.Title>User Login</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loginError && <Alert data-testid="login-error" variant="danger">Incorrect username or password.</Alert>}
                <Form onSubmit={handleSubmit(onSubmit)} method="post">
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label visuallyHidden={true}>Username</Form.Label>
                        <Form.Control {...register("username", {required: "This is required."})} type="text"
                                      placeholder="username" maxLength={255}/>
                    </Form.Group>
                    <Form.Group controlId="site">
                        <Form.Control {...register("site")} type="hidden" value={site}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label visuallyHidden={true}>Password</Form.Label>
                        <Form.Control {...register("password", {required: "This is required."})} type="password"
                                      placeholder="password" maxLength={1024}/>
                    </Form.Group>
                    <div style={{width: "100%"}}
                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Login</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default Login;
