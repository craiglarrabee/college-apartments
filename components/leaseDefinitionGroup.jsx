import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";

const LeaseDefinitionGroup = ({saveLeaseDefinition, start_date, end_date, description}) => {
    let [startDate, setStartDate] = useState(start_date);
    let [endDate, setEndDate] = useState(end_date);
    let [leaseDescription, setLeaseDescription] = useState(description);

    const updateStartDate = async(e) => {
        setStartDate(e.target.value);
        await saveLeaseDefinition({start_date: e.target.value, end_date: endDate, description: leaseDescription});
    }

    const updateDescription = async(e) => {
        setLeaseDescription(e.target.value);
        await saveLeaseDefinition({start_date: startDate, end_date: endDate, description: e.target.value});
    }

    const updateEndDate = async(e) => {
        setEndDate(e.target.value);
        await saveLeaseDefinition({start_date: startDate, end_date: e.target.value, description: leaseDescription});
    }

    return (
        <>
            <Row>
                <Form.Group as={Col} xs={3} className="mb-3" controlId="start_date">
                    <Form.Label>Lease Valid From</Form.Label>
                    <Form.Control required={false} type="date" onChange={updateStartDate} value={startDate} />
                </Form.Group>
                <Form.Group as={Col} xs={3} className="mb-3" controlId="end_date">
                    <Form.Label>Lease Valid Until</Form.Label>
                    <Form.Control required={false} type="date" onChange={updateEndDate} value={endDate} />
                </Form.Group>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="description">
                    <Form.Label>Lease Description</Form.Label>
                    <Form.Control required={false} type="text" onChange={updateDescription} value={leaseDescription} />
                </Form.Group>
            </Row>
        </>
    );
}

export default LeaseDefinitionGroup;