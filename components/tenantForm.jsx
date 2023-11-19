import {Button, Col, Form, Row} from "react-bootstrap";
import classNames from "classnames";
import React, {useState} from "react";
import {useForm} from "react-hook-form";

export const TenantForm = ({site, userId, tenant, isNewApplication, ...restOfProps }) => {

    const [convictedCrime, setConvictedCrime] = useState(tenant.hasOwnProperty("convicted_crime") ? tenant.convicted_crime : false);
    const [chargedCrime, setChargedCrime] = useState(tenant.hasOwnProperty("charged_crime") ? tenant.charged_crime : false);
    const {register, reset, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({defaultValues: {...tenant}});

    const handleConvicted = () => setConvictedCrime(true);
    const handleNotConvicted = () => setConvictedCrime(false);
    const handleCharged = () => setChargedCrime(true);
    const handleNotCharged = () => setChargedCrime(false);

    const isValidBirthdate = (date) => {
        const sixteenYearsAgo = new Date();
        sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
        return new Date(date) <= sixteenYearsAgo;
    };

    const onSubmitPersonal = async (data, event) => {
        event.preventDefault();

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/tenant?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    reset(data);
                    if (isNewApplication) location = `/application?site=${site}`;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <Form onSubmit={handleSubmit(onSubmitPersonal)} method="post">
                <div className="h4">Personal Information:</div>
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
                    <Form.Group as={Col} className="mb-3" controlId="middle_name">
                        <Form.Label>Middle Name</Form.Label>
                        <Form.Control
                            className={errors && errors.middle_name && classNames("border-danger")} {...register("middle_name", {maxLength: 25})}
                            type="text" placeholder="Middle Name"/>
                        {errors && errors.middle_name && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.middle_name.message}</Form.Text>}
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
                    <Form.Group as={Col} className="mb-3" controlId="gender" required>
                        <Form.Label className="required">Gender</Form.Label>
                        <Form.Select {...register("gender")}>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </Form.Select>
                        {errors && errors.gender &&
                            <Form.Text
                                className={classNames("text-danger")}>{errors && errors.gender.message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="date_of_birth">
                        <Form.Label className="required">Birthdate</Form.Label>
                        <Form.Control
                            className={errors && errors.date_of_birth && classNames("border-danger")} {...register("date_of_birth", {
                            required: {value: true, message: "Birthdate is required."},
                            validate: isValidBirthdate
                        })} type="date"/>
                        {errors && errors.date_of_birth && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.date_of_birth.message}</Form.Text>}
                        {errors && errors.date_of_birth && errors && errors.date_of_birth.type === "validate" &&
                            <Form.Text className={classNames("text-danger")}>Please enter a valid
                                birthdate.</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="last_4_social">
                        <Form.Label className="required">Last 4 Social Security #</Form.Label>
                        <Form.Control
                            className={errors && errors.last_4_social && classNames("border-danger")} {...register("last_4_social", {
                            required: {
                                value: true,
                                message: "Last 4 Social Security # is required."
                            }, pattern: {
                                value: /^\d{4}$/,
                                message: "Please enter the last 4 digits of your SSAN"
                            }
                        })} type="text" placeholder="Last 4 SSAN"/>
                        {errors && errors.last_4_social && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.last_4_social.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="cell_phone">
                        <Form.Label className="required">Cell Phone</Form.Label>
                        <Form.Control
                            className={errors && errors.cell_phone && classNames("border-danger")} {...register("cell_phone", {
                            required: {
                                value: true,
                                message: "Cell Phone is required."
                            }
                        })} type="tel"
                            placeholder="Cell Phone"/>
                        {errors && errors.cell_phone && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.cell_phone.message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="cell_phone2">
                        <Form.Label>Alternate Cell Phone</Form.Label>
                        <Form.Control
                            className={errors && errors.cell_phone2 && classNames("border-danger")} {...register("cell_phone2")}
                            type="tel"
                            placeholder="Alternate Cell Phone"/>
                        {errors && errors.cell_phone2 && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.cell_phone2.message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="home_phone">
                        <Form.Label className="required">Home Phone</Form.Label>
                        <Form.Control
                            className={errors && errors.home_phone && classNames("border-danger")} {...register("home_phone", {})}
                            type="tel"
                            placeholder="Home Phone"/>
                        {errors && errors.home_phone && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.home_phone.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} xs={6} className="mb-3" controlId="email">
                        <Form.Label className="required">Email</Form.Label>
                        <Form.Control
                            className={errors && errors.email && classNames("border-danger")} {...register("email", {
                            required: {value: true, message: "Email is required."},
                            maxLength: 255,
                            pattern: {
                                value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: "Please enter a valid email address"
                            }
                        })} type="email" placeholder="Email"
                        />
                        {errors && errors.email &&
                            <Form.Text
                                className={classNames("text-danger")}>{errors && errors.email.message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} xs={6} className="mb-3" controlId="email2">
                        <Form.Label>Alternate Email</Form.Label>
                        <Form.Control
                            className={errors && errors.email2 && classNames("border-danger")} {...register("email2", {
                            maxLength: 255,
                            pattern: {
                                value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: "Please enter a valid email address"
                            }
                        })} type="email" placeholder="Alternate Email"
                        />
                        {errors && errors.email2 &&
                            <Form.Text
                                className={classNames("text-danger")}>{errors && errors.email2.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <div className="d-inline-flex">
                    <div className="required">Have you ever been convicted of a crime?&nbsp;</div>
                    <Form.Group controlId={"convicted_crime"}>
                        <Form.Check className="mb-3" onClick={handleConvicted} {...register("convicted_crime", {
                            required: true,
                            setValueAs: value => value !== null ? value.toString() : ""
                        })} type="radio" inline value="1" label="Yes"/>
                        <Form.Check className="mb-3" onClick={handleNotConvicted} {...register("convicted_crime", {
                            required: true,
                            setValueAs: value => value !== null ? value.toString() : ""
                        })} type="radio" inline value="0" label="No"/>
                    </Form.Group>
                </div>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="convicted_explain" hidden={!convictedCrime}>
                        <Form.Label className="required">Explain</Form.Label>
                        <Form.Control
                            className={errors && errors.convicted_explain && classNames("border-danger")} {...register("convicted_explain",
                            {
                                required: {value: convictedCrime, message: "Please enter an explanation"},
                                maxLength: 1000
                            })} as="textarea" type="text" placeholder="Explanation" rows={3}/>
                        {errors && errors.convicted_explain && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.convicted_explain.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <div className="d-inline-flex">
                    <div className="required">Have you ever been charged with a crime?&nbsp;</div>
                    <Form.Check className="mb-3" onClick={handleCharged} {...register("charged_crime", {
                        required: true,
                        setValueAs: value => value !== null ? value.toString() : ""
                    })} type="radio" inline value="1" label="Yes"/>
                    <Form.Check className="mb-3" onClick={handleNotCharged} {...register("charged_crime", {
                        required: true,
                        setValueAs: value => value !== null ? value.toString() : ""
                    })} type="radio" inline value="0" label="No"/>
                </div>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="charged_explain" hidden={!chargedCrime}>
                        <Form.Label className="required">Explain</Form.Label>
                        <Form.Control
                            className={errors && errors.charged_explain && classNames("border-danger")} {...register("charged_explain", {
                            required: {
                                value: chargedCrime,
                                message: "Please enter an explanation."
                            }
                        })} as="textarea" type="text" placeholder="Explanation" rows={3}
                        />
                        {errors && errors.charged_explain && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.charged_explain.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <div className="h4">Address:</div>
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
                        <Form.Control
                            className={errors && errors.state && classNames("border-danger")} {...register("state", {
                            required: {
                                value: true,
                                message: "State is required."
                            }
                        })} type="text" placeholder="State"/>
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
                                message: "Zip Code is required."
                            }
                        })} type="text" placeholder="Zip Code"/>
                        {errors && errors.zip &&
                            <Form.Text className={classNames("text-danger")}>{errors && errors.zip.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <div className="h4">Parent/Guardian Info:</div>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="parent_name">
                        <Form.Label className="required">Parent Name</Form.Label>
                        <Form.Control
                            className={errors && errors.parent_name && classNames("border-danger")} {...register("parent_name", {
                            required: {
                                value: true,
                                message: "Parent Name is required."
                            }
                        })} type="text" placeholder="Name"/>
                        {errors && errors.parent_name && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.parent_name.message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="parent_phone">
                        <Form.Label className="required">Parent Phone</Form.Label>
                        <Form.Control
                            className={errors && errors.parent_phone && classNames("border-danger")} {...register("parent_phone", {
                            required: {
                                value: true,
                                message: "Parent Phone is required."
                            }
                        })} type="text" placeholder="Phone"/>
                        {errors && errors.parent_phone && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.parent_phone.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="parent_street">
                        <Form.Label className="required">Parent Street Address</Form.Label>
                        <Form.Control
                            className={errors && errors.parent_street && classNames("border-danger")} {...register("parent_street", {
                            required: {
                                value: true,
                                message: "Parent Street Address is required."
                            }
                        })} type="text" placeholder="Street Address"
                        />
                        {errors && errors.parent_street && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.parent_street.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} xs={6} className="mb-3" controlId="parent_city">
                        <Form.Label className="required">Parent City</Form.Label>
                        <Form.Control
                            className={errors && errors.parent_city && classNames("border-danger")} {...register("parent_city", {
                            required: {
                                value: true,
                                message: "Parent City is required."
                            }
                        })} type="text" placeholder="City"/>
                        {errors && errors.parent_city && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.parent_city.message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="parent_state">
                        <Form.Label className="required">Parent State</Form.Label>
                        <Form.Control
                            className={errors && errors.parent_state && classNames("border-danger")} {...register("parent_state", {
                            required: {
                                value: true,
                                message: "Parent State is required."
                            }
                        })} type="text" placeholder="State"/>
                        {errors && errors.parent_state && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.parent_state.message}</Form.Text>}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="parent_zip">
                        <Form.Label className="required">Parent Zip Code</Form.Label>
                        <Form.Control
                            className={errors && errors.parent_zip && classNames("border-danger")} {...register("parent_zip", {
                            required: {
                                value: true,
                                message: "Parent Zip Code is required."
                            }
                        })} type="text" placeholder="Zip Code"/>
                        {errors && errors.parent_zip && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.parent_zip.message}</Form.Text>}
                    </Form.Group>
                </Row>
                <div style={{width: "100%"}}
                     className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                    <Button variant="primary" type="submit"
                            disabled={!isNewApplication && (!isDirty || !isValid)}>{isNewApplication ? "Next" : "Save"}</Button>
                </div>
            </Form>

        </>
    );
}