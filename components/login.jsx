import {Alert, Button, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";
import {useForm} from "react-hook-form";
import Router from "next/router";

const Login = ({show, close, setNewUser, site, ...restOfProps }) => {
    const [loginError, setLoginError] = useState(false);
    const {register, formState: {isValid, isDirty, errors}, handleSubmit} = useForm();

    const handleClose = () => {
        setLoginError(false);
        close();
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            // Get data from the form.
            data.site = site;

            // Send the data to the server in JSON format.
            const JSONdata = JSON.stringify(data)

            // Form the request for sending data to the server.
            const options = {
                // The method is POST because we are sending data.
                method: "POST",
                // Tell the server we're sending JSON.
                headers: {
                    "Content-Type": "application/json",
                },
                // Body of the request is the JSON data we created above.
                body: JSONdata,
            }
            const resp = await fetch(`/api/login?site=${site}`, options);
            switch (resp.status) {
                case 200:
                    setLoginError(false);
                    setNewUser(await resp.json());
                    close();
                    Router.reload();
                    return;
                case 400:
                default:
                    setLoginError(true);
                    break;
            }

        } catch (e) {
            console.error(e);
        }
    };

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
                {loginError && <Alert variant="danger" >Incorrect username or password.</Alert>}
                <Form onSubmit={handleSubmit(onSubmit)} method="post">
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label visuallyHidden={true}>Username</Form.Label>
                        <Form.Control {...register("username", {required: "This is required."})} type="text" placeholder="username" maxLength={25} />
                    </Form.Group>
                    <Form.Group controlId="site">
                        <Form.Control {...register("site")} type="hidden" value={site} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label visuallyHidden={true}>Password</Form.Label>
                        <Form.Control {...register("password", {required: "This is required."})} type="password" placeholder="password" maxLength={100} />
                    </Form.Group>
                    <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Login</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default Login;
