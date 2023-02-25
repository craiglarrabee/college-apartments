import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";

const TenantFormGroups = ({readOnly, tenantData}) => {
    let [convictedCrime, setConvictedCrime] = useState(tenantData.hasOwnProperty("convicted_crime") ? tenantData.convicted_crime : false);
    let [chargedCrime, setChargedCrime] = useState(tenantData.hasOwnProperty("charged_crime") ? tenantData.charged_crime : false);

    const handleConvicted = () => setConvictedCrime(true);
    const handleNotConvicted = () => setConvictedCrime(false);
    const handleCharged = () => setChargedCrime(true);
    const handleNotCharged = () => setChargedCrime(false);

    return (
        <>
            <div className="h4">Personal Information:</div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="first_name">
                    <Form.Label visuallyHidden={true}>First Name</Form.Label>
                    <Form.Control name="first_name" required type="text" placeholder="First Name" maxLength={25}
                                  defaultValue={tenantData.first_name}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="middle_name">
                    <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                    <Form.Control name="middle_name" type="text" placeholder="Middle Name" maxLength={25} defaultValue={tenantData.middle_name}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="last_name">
                    <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                    <Form.Control name="last_name" required type="text" placeholder="Last Name" maxLength={25} defaultValue={tenantData.last_name}/>
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="gender" required>
                    <Form.Select defaultValue={tenantData.gender} placeholder="Gender" required={true}>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="date_of_birth">
                    <Form.Label visuallyHidden={true}>Date of birth</Form.Label>
                    <Form.Control name="date_of_birth" required type="date" placeholder="Date of birth" defaultValue={tenantData.date_of_birth}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="last_4_social">
                    <Form.Label visuallyHidden={true}>Last 4 Social Security #</Form.Label>
                    <Form.Control name="last_4_social" required type="text" placeholder="Last 4 SSAN" maxLength={11}
                                  defaultValue={tenantData.last_4_social}/>
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="cell_phone">
                    <Form.Label visuallyHidden={true}>Cell Phone</Form.Label>
                    <Form.Control name="cell_phone" required type="tel" placeholder="Cell Phone" maxLength={16} defaultValue={tenantData.cell_phone}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="cell_phone2">
                    <Form.Label visuallyHidden={true}>Cell Phone</Form.Label>
                    <Form.Control name="cell_phone2" type="tel" placeholder="Alternate Cell Phone" maxLength={16} defaultValue={tenantData.cell_phone2}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="home_phone">
                    <Form.Label visuallyHidden={true}>Home Phone</Form.Label>
                    <Form.Control name="home_phone" required type="tel" placeholder="Home Phone" maxLength={16} defaultValue={tenantData.home_phone}/>
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="email">
                    <Form.Label visuallyHidden={true}>Home Phone</Form.Label>
                    <Form.Control name="email" required type="email" placeholder="Email" maxLength={255} defaultValue={tenantData.email}/>
                </Form.Group>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="email2">
                    <Form.Label visuallyHidden={true}>Home Phone</Form.Label>
                    <Form.Control name="email2" type="email" placeholder="Alternate Email" maxLength={255} defaultValue={tenantData.email2}/>
                </Form.Group>
            </Row>
            <div className="d-inline-flex">
                <div>Have you ever been convicted of a crime?&nbsp;</div>
                <Form.Check className="mb-3" name="convicted_crime" type="radio" id="convicted_crime_true" inline required value={"true"} label="Yes"
                            onClick={handleConvicted} defaultChecked={convictedCrime}/>
                <Form.Check className="mb-3" name="convicted_crime" type="radio" id="convicted_crime_false" inline required value={"false"} label="No"
                            onClick={handleNotConvicted} defaultChecked={!convictedCrime}/>
            </div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="convicted_explain" hidden={!convictedCrime}>
                    <Form.Label visuallyHidden={true}>Home Phone</Form.Label>
                    <Form.Control name="convicted_explain" as="textarea" type="text" placeholder="Explanation" rows={3} maxLength={1000}
                                  defaultValue={tenantData.convicted_explain}/>
                </Form.Group>
            </Row>
            <div className="d-inline-flex">
                <div>Have you ever been charged with a crime?&nbsp;</div>
                <Form.Check className="mb-3" name="charged_crime" type="radio" id="charged_crime_true" required inline label="Yes"
                            onClick={handleCharged} defaultChecked={chargedCrime}/>
                <Form.Check className="mb-3" name="charged_crime" type="radio" id="charged_crime_false" required inline label="No"
                            onClick={handleNotCharged} defaultChecked={!chargedCrime}/>
            </div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="charged_explain" hidden={!chargedCrime}>
                    <Form.Label visuallyHidden={true}>Home Phone</Form.Label>
                    <Form.Control name="charged_explain" as="textarea" type="text" placeholder="Explanation" rows={3} maxLength={1000}
                                  defaultValue={tenantData.charged_explain}/>
                </Form.Group>
            </Row>
            <div className="h4">Address:</div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="street">
                    <Form.Label visuallyHidden={true}>Street Address</Form.Label>
                    <Form.Control name="street" required type="text" placeholder="Street Address" maxLength={100} defaultValue={tenantData.street}/>
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="city">
                    <Form.Label visuallyHidden={true}>City</Form.Label>
                    <Form.Control name="city" required type="text" placeholder="City" maxLength={25} defaultValue={tenantData.city}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="state">
                    <Form.Label visuallyHidden={true}>State</Form.Label>
                    <Form.Control name="state" required type="text" placeholder="State" maxLength={2} defaultValue={tenantData.state}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="zip">
                    <Form.Label visuallyHidden={true}>Zip Code</Form.Label>
                    <Form.Control name="zip" required type="text" placeholder="Zip Code" maxLength={10} defaultValue={tenantData.zip}/>
                </Form.Group>
            </Row>
            <div className="h4">Parent/Guardian Info:</div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="parent_name">
                    <Form.Label visuallyHidden={true}>Parent Name</Form.Label>
                    <Form.Control name="parent_name" required type="text" placeholder="Name" maxLength={50} defaultValue={tenantData.parent_name}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="parent_phone">
                    <Form.Label visuallyHidden={true}>Parent Phone</Form.Label>
                    <Form.Control name="parent_phone" required type="text" placeholder="Phone" maxLength={16} defaultValue={tenantData.parent_phone}/>
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="parent_street">
                    <Form.Label visuallyHidden={true}>Parent Street Address</Form.Label>
                    <Form.Control name="parent_street" required type="text" placeholder="Street Address" maxLength={100}
                                  defaultValue={tenantData.parent_street}/>
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="parent_city">
                    <Form.Label visuallyHidden={true}>Parent City</Form.Label>
                    <Form.Control name="parent_city" required type="text" placeholder="City" maxLength={25} defaultValue={tenantData.parent_city}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="parent_state">
                    <Form.Label visuallyHidden={true}>Parent State</Form.Label>
                    <Form.Control name="parent_state" required type="text" placeholder="State" maxLength={2} defaultValue={tenantData.parent_state}/>
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="parent_zip">
                    <Form.Label visuallyHidden={true}>Parent Zip Code</Form.Label>
                    <Form.Control name="parent_zip" required type="text" placeholder="Zip Code" maxLength={10} defaultValue={tenantData.parent_zip}/>
                </Form.Group>
            </Row>
        </>
    );
}

export default TenantFormGroups;