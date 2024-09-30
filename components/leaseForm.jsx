import {Button, Col, Form, Row} from "react-bootstrap";
import React from "react";
import classNames from "classnames";
import {useForm} from "react-hook-form";
import LeaseDefinitionGroup from "./leaseDefinitionGroup";
import PageContent from "./pageContent";
import LeaseRoom from "./leaseRoom";

const LeaseForm = ({
                       navPage, site, userId, leaseId, lease, canEdit, lease_header, accommodations_header,
                       accommodations_body, rent_header, rent_body, vehicle_header, vehicle_body, lease_body,
                       lease_acceptance, rules, cleaning, repairs, rooms
                       , ...restOfProps
                   }) => {
    const {register, formState: {errors, isValid, isDirty}, handleSubmit} = useForm({defaultValues: lease});
    const today = new Date().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});
    const submitted = lease.lease_date !== null;

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            console.error(new Date().toISOString() + " - " +e);
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit(onSubmit)} method="post">
                {canEdit ? <LeaseDefinitionGroup {...lease} className={classNames("custom-content")}/> : null}
                <PageContent
                    initialContent={lease_header}
                    site={site}
                    page={navPage}
                    name="lease_header"
                    canEdit={canEdit}/>

                <Form.Group controlId="lease_date">
                    <Form.Control name="lease_date" type="hidden" value={submitted ? lease.lease_date : today}/>
                </Form.Group>
                <div>This Contract is entered into on <strong>{lease.signed_date}</strong>, {site === "suu" ? "between Stadium Way/College Way" : "between Park Place Apartments, L.L.C."}Apartments, LLC, L.L.C.
                    (hereinafter &quot;Landlord&quot;),
                    and <strong>{lease.name ? lease.name : "____________________________"}</strong> (hereinafter &quot;Resident&quot;).
                </div>
                <PageContent
                    initialContent={accommodations_header}
                    site={site}
                    page={navPage}
                    name="accommodations_header"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={accommodations_body}
                    site={site}
                    page={navPage}
                    name="accommodations_body"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={rent_header}
                    site={site}
                    page={navPage}
                    name="rent_header"
                    canEdit={canEdit}/>
                <div style={{display: "flex", flexDirection: "column"}}>
                    {rooms.map(room => <LeaseRoom {...room} canEdit={canEdit} site={site}/>)}
                </div>
                <div style={{fontWeight: "bold"}}>I pick room type
                    #{lease.room_type_id ? lease.room_type_id : "__"} ABOVE FOR THE RENT PER SEMESTER SET FORTH
                    less a discount per semester of
                    ${lease.lease_discount} .
                </div>
                {lease.apartment_number &&
                    <div style={{fontWeight: "bold"}}>
                        I will reside in apartment number: {lease.apartment_number}
                    </div>
                }
                <PageContent
                    initialContent={rent_body}
                    site={site}
                    page={navPage}
                    name="rent_body"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={vehicle_header}
                    site={site}
                    page={navPage}
                    name="vehicle_header"
                    canEdit={canEdit}/>
                <div style={{fontWeight: "bold"}}>Resident&apos;s vehicle is:
                    <Row>
                        <Form.Group controlId={"vehicle_color"}>
                            <Form.Label column="sm">Color</Form.Label>
                            <Col xs="2">
                                <Form.Control{...register("vehicle_color", {disabled: submitted, maxLength: 50})}
                                             type="text"/>
                            </Col>
                        </Form.Group>
                        <Form.Group controlId={"vehicle_make_model"}>
                            <Form.Label column="sm">Make/Model</Form.Label>
                            <Col xs="5">
                                <Form.Control{...register("vehicle_make_model", {disabled: submitted, maxLength: 100})}
                                             type="text"/>
                            </Col>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group controlId={"vehicle_license"}>
                            <Form.Label column="sm">License No.</Form.Label>
                            <Col xs="2">
                                <Form.Control{...register("vehicle_license", {disabled: submitted, maxLength: 10})}
                                             type="text"/>
                            </Col>
                        </Form.Group>
                        <Form.Group controlId={"vehicle_state"}>
                            <Form.Label column="sm">State</Form.Label>
                            <Col xs="5">
                                <Form.Control{...register("vehicle_state", {disabled: submitted, maxLength: 30})}
                                             type="text"/>
                            </Col>
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group controlId={"vehicle_owner"}>
                            <Form.Label column="sm">REGISTERED OWNER&apos;S NAME</Form.Label>
                            <Col xs="8">
                                <Form.Control{...register("vehicle_owner", {disabled: submitted, maxLength: 100})}
                                             type="text"/>
                            </Col>
                        </Form.Group>
                    </Row>
                </div>
                <PageContent
                    initialContent={vehicle_body}
                    site={site}
                    page={navPage}
                    name="vehicle_body"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={lease_body}
                    site={site}
                    page={navPage}
                    name="lease_body"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={lease_acceptance}
                    site={site}
                    page={navPage}
                    name="lease_acceptance"
                    canEdit={canEdit}/>
                <Row>
                    <Form.Group controlId={"signature"}>
                        <Form.Label column>Resident Name</Form.Label>
                        <Col xs="9">
                            <Form.Control{...register("signature", {
                                disabled: submitted,
                                required: true,
                                maxLength: 100
                            })}
                                         type="text"/>
                        </Col>
                    </Form.Group>
                </Row>
                <div>(Signature-Type for electronic signature over internet)</div>
                <br/>
                <Row>
                    <Form.Group controlId={"lease_email"}>
                        <Form.Label column>Email Address</Form.Label>
                        <Col xs="9">
                            <Form.Control{...register("lease_email", {
                                disabled: submitted,
                                required: true,
                                maxLength: 100
                            })}
                                         type="text"/>
                        </Col>
                    </Form.Group>
                </Row>
                <br/>
                <Row>
                    <Col>
                        <Form.Group controlId={"lease_address"}>
                            <Form.Label visuallyHidden>Tenant&apos;s Full Address</Form.Label>
                            <Form.Control{...register("lease_address", {
                                disabled: submitted,
                                required: true,
                                maxLength: 200
                            })} type="text"/>
                        </Form.Group>
                    </Col>
                </Row>
                <div>Tenant&apos;s Full Address: Street, City, State and Zip Code (NO P.O. BOXES)</div>
                <br/>
                <Row>
                    <Form.Group controlId={"lease_cell_phone"}>
                        <Form.Label column>Tenant&apos;s Cell Phone with Area Code</Form.Label>
                        <Col>
                            <Form.Control{...register("lease_cell_phone", {
                                disabled: submitted,
                                required: true,
                                maxLength: 20
                            })} type="text"/>
                        </Col>
                    </Form.Group>
                </Row>
                <br/>
                <div>FOR EMERGENCY PURPOSES</div>
                <Row>
                    <Form.Group controlId={"lease_parent_name"}>
                        <Form.Label column>Parents&apos; names</Form.Label>
                        <Col>
                            <Form.Control{...register("lease_parent_name", {
                                disabled: submitted,
                                required: true,
                                maxLength: 255
                            })} type="text"/>
                        </Col>
                    </Form.Group>
                </Row>
                <br/>
                <Row>
                    <Form.Group controlId={"lease_parent_phone"}>
                        <Form.Label column>and cell phone number with area codes</Form.Label>
                        <Col>
                            <Form.Control{...register("lease_parent_phone", {
                                disabled: submitted,
                                required: true,
                                maxLength: 50
                            })} type="text"/>
                        </Col>
                    </Form.Group>
                </Row>
                <br/>
                <br/>
                {submitted ? <></> : <div style={{width: "100%"}}
                                          className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                    <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Submit</Button></div>}
                <PageContent
                    initialContent={rules}
                    site={site}
                    page={navPage}
                    name="rules"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={repairs}
                    site={site}
                    page={navPage}
                    name="repairs"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={cleaning}
                    site={site}
                    page={navPage}
                    name="cleaning"
                    canEdit={canEdit}/>
            </Form>
        </>
    );
}

export default LeaseForm;