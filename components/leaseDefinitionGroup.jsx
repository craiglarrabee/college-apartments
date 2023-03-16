import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";

const LeaseDefinitionGroup = ({start_date, end_date, description, id}) => {
    const [timer, setTimer] = useState(null);
    let [startDate, setStartDate] = useState(start_date);
    let [endDate, setEndDate] = useState(end_date);
    let [leaseDescription, setLeaseDescription] = useState(description);

    const startDateChanged = async(e) => {
        setStartDate(e.target.value);
        clearTimeout(timer);
        const newTimer = setTimeout(async () => {
            await saveLeaseDefinition({start_date: e.target.value, end_date: endDate, description: leaseDescription});
        }, 1500);
        setTimer(newTimer);
    }

    const descriptionChanged = async(e) => {
        setLeaseDescription(e.target.value);
        clearTimeout(timer);
        const newTimer = setTimeout(async () => {
            await saveLeaseDefinition({start_date: startDate, end_date: endDate, description: e.target.value});
        }, 1500);
        setTimer(newTimer);
    }

    const endDateChanged = async(e) => {
        setEndDate(e.target.value);
        clearTimeout(timer);
        const newTimer = setTimeout(async () => {
            await saveLeaseDefinition({start_date: startDate, end_date: e.target.value, description: leaseDescription});
        }, 1500);
        setTimer(newTimer);
    }

    const saveLeaseDefinition = async (data) => {
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/leases/${id}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <Row>
                <Form.Group as={Col} xs={3} className="mb-3" controlId="start_date">
                    <Form.Label>Lease Valid From</Form.Label>
                    <Form.Control required={false} type="date" onChange={startDateChanged} value={startDate} />
                </Form.Group>
                <Form.Group as={Col} xs={3} className="mb-3" controlId="end_date">
                    <Form.Label>Lease Valid Until</Form.Label>
                    <Form.Control required={false} type="date" onChange={endDateChanged} value={endDate} />
                </Form.Group>
                <Form.Group as={Col} xs={6} className="mb-3" controlId="description">
                    <Form.Label>Lease Description</Form.Label>
                    <Form.Control required={false} type="text" onChange={descriptionChanged} value={leaseDescription} />
                </Form.Group>
            </Row>
        </>
    );
}

export default LeaseDefinitionGroup;