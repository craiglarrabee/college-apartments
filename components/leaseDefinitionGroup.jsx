import {Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";

const LeaseDefinitionGroup = ({start_date, end_date, description, fall_year, summer_year, spring_year, id, register = () => {}}) => {
    const [timer, setTimer] = useState(null);
    const [startDate, setStartDate] = useState(start_date);
    const [endDate, setEndDate] = useState(end_date);
    const [leaseDescription, setLeaseDescription] = useState(description);
    const [fallYear, setFallYear] = useState(fall_year);
    const [summerYear, setSummerYear] = useState(summer_year);
    const [springYear, setSpringYear] = useState(spring_year);

    const firstYear = startDate ? new Date(startDate).getUTCFullYear() : new Date().getFullYear();
    const secondYear = firstYear + 1;

    useEffect(() => {
        updateIfReady();
    }, [endDate, startDate, leaseDescription, fallYear, springYear, summerYear]);

    const updateIfReady = async() => {
        clearTimeout(timer);
        const newTimer = setTimeout(async () => {
            await saveLeaseDefinition({start_date: startDate ? startDate : null, end_date: endDate ? endDate : null, description: leaseDescription, fall_year: fallYear, summer_year: summerYear, spring_year: springYear});
        }, 1500);
        setTimer(newTimer);
    };

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
    };

    return (
        <>
            <Row>
                <Col xs={3}>
                    <Form.Label>Visible From</Form.Label>
                    <Form.Control{...register("start_date", {onChange: (e) => setStartDate(e.target.value) })} type="date" value={startDate} />
                </Col>
                <Col xs={3} className="mb-3" >
                    <Form.Label>Visible Until</Form.Label>
                    <Form.Control {...register("end_date", {onChange: (e) => setEndDate(e.target.value) })} type="date" value={endDate} />
                </Col>
                <Col xs={6} className="mb-3" >
                    <Form.Label>Description</Form.Label>
                    <Form.Control {...register("description", {required: true, maxLength: 100, onChange: (e) => setLeaseDescription(e.target.value) })} type="text" value={leaseDescription} />
                </Col>
            </Row>
            <Row>
                <Col >
                    <Form.Label>Valid Semesters:&nbsp;</Form.Label>
                    <Form.Check
                        className="mb-3" {...register("fall_year", {onChange: (e) => e.target.checked ? setFallYear(secondYear) : setFallYear(null) })}
                        type="checkbox" id="fall_year" label={`Fall ${firstYear}`} inline />
                    <Form.Check
                        className="mb-3" {...register("spring_year", {onChange: (e) => e.target.checked ? setSpringYear(secondYear) : setSpringYear(null) })}
                        type="checkbox" id="spring_year" label={`Spring ${secondYear}`} inline />
                    <Form.Check
                        className="mb-3" {...register("summer_year", {onChange: (e) => e.target.checked ? setSummerYear(secondYear) : setSummerYear(null) })}
                        type="checkbox" id="summer_year" label={`Summer ${secondYear}`} inline />
                </Col>
            </Row>
        </>
    );
}

export default LeaseDefinitionGroup;