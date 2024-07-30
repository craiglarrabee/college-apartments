import {Button, Form} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";
import {useForm} from "react-hook-form";

const Password = ({site, admin, userId, username, setUserInfoSuccess, setUserInfoError, ...restOfProps}) => {
    const {register, getValues, formState: {isValid, isDirty, errors}, handleSubmit} = useForm();
    const [pwd, setPwd] = useState("");

    const changePassword = async (data, event) => {
        event.preventDefault();

        try {
            data.site = site;
            data.username = username;
            data.admin = admin;

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/password?site=${site}`, options)
            switch (resp.status) {
                case 200:
                case 204:
                    setUserInfoSuccess(`Password changed for ${username}`)
                    break;
                case 401:
                case 403:
                    setUserInfoError("Your cannot change passwords");
                    break;
                case 400:
                default:
                    setUserInfoError("An error occurred changing the password")
                    break;
            }

        } catch (e) {
            setUserInfoError("An error occurred changing the password")
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit(changePassword)} method="post">
                <div className="h5">Change Password</div>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                    <Form.Control
                        className={errors && errors.password && classNames("border-danger")} {...register("password", {
                        required: {value: true, message: "Password is required."},
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,100}$/,
                        }
                    })} type="password" placeholder="password"
                        onChange={(e) => setPwd(e.currentTarget.value)}/>
                    {errors && errors.password && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.password.message}</Form.Text>}
                    <Form.Text>
                        <div>Password must contain:</div>
                        <ul style={{listStyleType: "none"}}>
                            <li className={pwd.length > 8 && pwd.length < 101 ? "text-success" : "text-danger"}>Between
                                8 and 100 chars
                            </li>
                            <li className={pwd.match(/.*\d/) ? "text-success" : "text-danger"}>At
                                least one
                                number
                            </li>
                            <li className={pwd.match(/.*[a-z]/) ? "text-success" : "text-danger"}>At
                                least
                                one
                                lower-case character
                            </li>
                            <li className={pwd.match(/.*[A-Z]/) ? "text-success" : "text-danger"}>At
                                least
                                one
                                upper-case character
                            </li>
                            <li className={pwd.match(/.*[@$!%*?&#]/) ? "text-success" : "text-danger"}>At
                                least
                                one special character
                            </li>
                        </ul>
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirm_password">
                    <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                    <Form.Control  {...register("confirm_password",
                        {
                            validate: {
                                passwordEqual: (value) => value === getValues().password || "Must match new password"
                            }
                        })} type="password" placeholder="confirm new password"/>
                    {errors && errors.confirm_password &&
                        <Form.Text
                            className={classNames("text-danger")}>{errors && errors.confirm_password.message}</Form.Text>
                    }
                </Form.Group>
                <div style={{width: "100%"}}
                     className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                    <Button variant="primary" type="submit"
                            disabled={!isDirty}>{`Change Password for ${username}`}</Button>
                </div>
            </Form>
        </>
    );
}

export default Password;
