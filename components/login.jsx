import {Button, Form, Modal} from "react-bootstrap";
import React from "react";
import classNames from "classnames";


const Login = ({show, handleClose, setNewUser, site}) => {

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            // Get data from the form.
            const data = {
                username: event.target.username.value,
                password: event.target.password.value,
                site: site,
            }

            // Send the data to the server in JSON format.
            const JSONdata = JSON.stringify(data)

            // API endpoint where we send form data.
            const endpoint = '/api/login'

            // Form the request for sending data to the server.
            const options = {
                // The method is POST because we are sending data.
                method: 'POST',
                // Tell the server we're sending JSON.
                headers: {
                    'Content-Type': 'application/json',
                },
                // Body of the request is the JSON data we created above.
                body: JSONdata,
            }

            const resp = await fetch(endpoint, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                    setNewUser(await resp.json());
            }

        } catch (e) {

        }
    }

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
                <Form onSubmit={handleLogin} method="post">
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label visuallyHidden={true}>First Name</Form.Label>
                        <Form.Control name="username" required type="text" placeholder="username" maxLength={25} />
                    </Form.Group>
                    <Form.Group controlId="site">
                        <Form.Control name="site" type="hidden" value={site} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                        <Form.Control name="password" type="password" placeholder="password" maxLength={100} />
                    </Form.Group>
                    <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        <Button variant="primary" type="submit">Login</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default Login;
