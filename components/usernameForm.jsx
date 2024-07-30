import {Button, Form} from "react-bootstrap";
import React from "react";
import classNames from "classnames";
import {useForm} from "react-hook-form";

const Username = ({site, userId, username, setUserInfoSuccess, setUserInfoError, ...restOfProps}) => {
    const {register, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({mode: "all"});

    const changeUsername = async (data, event) => {
        event.preventDefault();

        try {
            data.site = site;

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/username?site=${site}`, options)
            switch (resp.status) {
                case 200:
                case 204:
                    setUserInfoSuccess("Successfully changed username");
                    break;
                case 400:
                default:
                    setUserInfoError("An error occurred changing username");
                    break;
            }

        } catch (e) {
            setUserInfoError("An error occurred changing username");
        }
    }

    const checkUsername = async (value) => {
        try {
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
            const resp = await fetch(`/api/users/${value}?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                    let json = await resp.json();
                    return json.id === undefined;
            }
        } catch (e) {

        }
    };


    return (
        <Form onSubmit={handleSubmit(changeUsername)} method="post">
            <div className="h5">Change username</div>
            <Form.Group className="mb-3" controlId="username">
                <Form.Label visuallyHidden={true}>Username</Form.Label>
                <Form.Control
                    className={errors && errors.username && classNames("border-danger")} {...register("username", {
                    validate: checkUsername
                })} type="text" placeholder="username" maxLength={255}/>
                {errors && errors.username && errors && errors.username.type === "validate" &&
                    <Form.Text className={classNames("text-danger")}>Username is not available.</Form.Text>}
            </Form.Group>
            <div style={{width: "100%"}}
                 className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                <Button variant="primary" type="submit" disabled={!isDirty}>Submit</Button>
            </div>
        </Form>
    );
}

export default Username;
