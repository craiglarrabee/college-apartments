import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";

const UserFormGroups = () => {

    return (
        <>
            <div className="h4">User Information:</div>
            <Form.Group className="mb-3" controlId="username">
                <Form.Label visuallyHidden={true}>First Name</Form.Label>
                <Form.Control name="username" required type="text" placeholder="username" minLength={5} maxLength={25} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
                <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                <Form.Control name="password" type="password" placeholder="password" minLength={8} maxLength={100} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirm_password">
                <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                <Form.Control name="confirm_password" required type="password" placeholder="confirm password" minLength={8} maxLength={100} />
            </Form.Group>
        </>
    );
};

export default UserFormGroups;