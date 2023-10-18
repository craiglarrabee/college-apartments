import {Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";

const LeaseDefinitionGroup = ({site, start_date, end_date, description, semester1, semester2, id, register = () => {}}) => {
    const startSemesters = [];
    if (semester1) startSemesters.push(semester1);
    if (semester2) startSemesters.push(semester2);
    const [startDate, setStartDate] = useState(start_date);
    const [endDate, setEndDate] = useState(end_date);
    const [leaseDescription, setLeaseDescription] = useState(description);
    const [leaseSemesters, setLeaseSemesters] = useState(startSemesters);

    const firstYear = startDate ? new Date(startDate).getUTCFullYear() : new Date().getFullYear();
    const secondYear = firstYear + 1;
    const fallSemester = `Fall ${firstYear}`;
    const springSemester = `Spring ${secondYear}`;
    const summerSemester = `Summer ${secondYear}`;

    useEffect(() => {
        const timer = setTimeout(async () => {
            await saveLeaseDefinition({start_date: startDate ? startDate : null, end_date: endDate ? endDate : null, description: leaseDescription, semesters: leaseSemesters});
        }, 1500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endDate, startDate, leaseDescription, leaseSemesters]);


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
                <Form.Group as={Col} controlId="start_date" xs={3}>
                    <Form.Label>Visible From</Form.Label>
                    <Form.Control{...register("start_date")} onChange={(e) => {
                        setStartDate(e.target.value)
                    }} type="date" value={startDate}/>
                </Form.Group>
                <Form.Group as={Col} controlId="end_date" xs={3} className="mb-3">
                    <Form.Label>Visible Until</Form.Label>
                    <Form.Control {...register("end_date")} onChange={(e) => {
                        setEndDate(e.target.value)
                    }} type="date" value={endDate}/>
                </Form.Group>
                <Form.Group as={Col} controlId="description" xs={6} className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control {...register("description", {required: true, maxLength: 100})}
                                  onChange={(e) => setLeaseDescription(e.target.value)} type="text"
                                  value={leaseDescription}/>
                </Form.Group>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Valid Semesters:&nbsp;</Form.Label>
                    <Form.Check
                        className="mb-3" {...register("fall_semester")} onChange={(e) => {
                        if (e.target.checked) {
                            setLeaseSemesters([...leaseSemesters, fallSemester]);
                        } else {
                            setLeaseSemesters(leaseSemesters.filter(semester => semester !== fallSemester));
                        }
                    }}
                        checked={leaseSemesters.includes(fallSemester)} disabled={leaseSemesters.length > 0 && leaseSemesters.includes(summerSemester)} type="checkbox" id="fall_semester"  key="fall_semester" label={fallSemester} inline/>
                    <Form.Check
                        className="mb-3" {...register("spring_semester")} onChange={(e) => {
                        if (e.target.checked) {
                            setLeaseSemesters([...leaseSemesters, springSemester]);
                        } else {
                            setLeaseSemesters(leaseSemesters.filter(semester => semester !== springSemester));
                        }
                    }}
                        checked={leaseSemesters.includes(springSemester)} disabled={leaseSemesters.length > 0 && leaseSemesters.includes(summerSemester)} type="checkbox" id="spring_semester"  key="spring_semester" label={springSemester} inline/>
                    {site === "suu" ?
                        <Form.Check
                            className="mb-3" {...register("summer_semester")} onChange={(e) => {
                            if (e.target.checked) {
                                setLeaseSemesters([summerSemester]);
                            } else {
                                setLeaseSemesters([]);
                            }
                        }}
                            checked={leaseSemesters.includes(summerSemester)} disabled={leaseSemesters.length > 0 && !leaseSemesters.includes(summerSemester)} type="checkbox" key="summer_semester" id="summer_semester" label={summerSemester} inline/>
                        : null}
                </Col>
            </Row>
        </>
    );
}

export default LeaseDefinitionGroup;