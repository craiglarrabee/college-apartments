import {Button, Col, Form, Row, Table} from "react-bootstrap";
import {useForm} from "react-hook-form";
import React, {useEffect, useState} from "react";
import classNames from "classnames";


export const UnprocessedApplicationList = ({data, page, site, leaseId, handleDelete, handleProcess}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Application Date</th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr key={row.user_id}>
                    <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
                    <td>{row.submit_date}</td>
                    <td><Button onClick={(e) => handleProcess(row.user_id, site, leaseId, true)}>Process</Button></td>
                    <td><Button onClick={(e) => handleDelete(row.user_id, site, leaseId)}>Delete</Button></td>
                </tr>))}
                </tbody>
            </Table>
        </>
    );
};
export const ProcessedApplicationList = ({data, page, site, leaseId, handleDelete, handleDeposit, handleProcess}) => {

    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Application Date</th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {
                    data.map(row => (
                        <tr key={row.user_id}>
                            <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
                            <td>{row.submit_date}</td>
                            <td><Button onClick={(e) => handleDeposit(row.user_id, site, leaseId)}>Deposit</Button></td>
                            <td><Button
                                onClick={(e) => handleProcess(row.user_id, site, leaseId, false)}>Unprocess</Button>
                            </td>
                            <td><Button onClick={(e) => handleDelete(row.user_id, site, leaseId)}>Delete</Button></td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
        </>
    );
};
export const DepositReceivedApplicationList = ({data, page, site, leaseId}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Deposit Date</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr>
                    <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
                    <td>{row.deposit_date}</td>
                </tr>))}
                </tbody>
            </Table>
        </>
    );
};


export const AssignedRow = ({page, site, row, leaseId, handleWelcome, addResetHook}) => {
    const {register, formState: {errors}, handleSubmit, reset} = useForm();
    addResetHook(row.user_id, reset);
    return (
        <tr>
            <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
            <td>{row.apartment_number}</td>
            <td>
                <Form onSubmit={handleSubmit(handleWelcome)} method="post">
                    <Form.Group controlId="site">
                        <Form.Control {...register("site")} type="hidden" value={site}/>
                    </Form.Group>
                    <Form.Group controlId="userId">
                        <Form.Control {...register("userId")} type="hidden" value={row.user_id}/>
                    </Form.Group>
                    <Form.Group controlId="leaseId">
                        <Form.Control {...register("leaseId")} type="hidden" value={leaseId}/>
                    </Form.Group>
                    <Row>
                        <div className={classNames("col-1")} style={{maxWidth: "5px"}}>$</div>
                        <Form.Group as={Col} xs="2" className="mb-3" controlId="discount">
                            <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                            <Form.Control {...register("discount", {
                                pattern: {
                                    value: /^\d{0,3}$/,
                                    message: "Please enter a valid amount"
                                }
                            })} type="text"/>
                            {errors && errors.discount && <Form.Text
                                className={classNames("text-danger")}>{errors && errors.discount.message}</Form.Text>}
                        </Form.Group>
                        <Button style={{maxHeight: "38px", maxWidth: "100px"}} xs="3" type="submit">Welcome</Button>
                    </Row>
                </Form>
            </td>
        </tr>
    )
};


export const WelcomedRow = ({page, site, row, leaseId}) => {
    const [fallYear, setFallYear] = useState(row.fall_year);
    const [summerYear, setSummerYear] = useState(row.summer_year);
    const [springYear, setSpringYear] = useState(row.spring_year);
    const {register } = useForm();

    useEffect(() => {
        saveTenantSemesters({fall_year: fallYear, summer_year: summerYear, spring_year: springYear});
    }, [fallYear, springYear, summerYear]);

    const saveTenantSemesters = async (data) => {
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${row.user_id}/leases/${leaseId}/tenant`, options)
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
        <tr>
            <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
            <td>{row.lease_date}</td>
            <td>
                <Form method="post">
                    <Row>
                        <Col>
                            {row.lease_fall_year ?
                            <Form.Check
                                className="mb-3" {...register("fall_year", {onChange: (e) => e.target.checked ? setFallYear(row.lease_fall_year) : setFallYear(null)})}
                                type="checkbox" id="fall_year" checked={fallYear} label={`Fall ${row.lease_fall_year}`} inline/>
                                : <></>}
                            {row.lease_spring_year ?
                            <Form.Check
                                className="mb-3" {...register("spring_year", {onChange: (e) => e.target.checked ? setSpringYear(row.lease_spring_year) : setSpringYear(null)})}
                                type="checkbox" id="spring_year" checked={springYear} label={`Spring ${row.lease_spring_year}`} inline/>
                                : <></>}
                            {row.lease_summer_year ?
                            <Form.Check
                                className="mb-3" {...register("summer_year", {onChange: (e) => e.target.checked ? setSummerYear(row.lease_summer_year) : setSummerYear(null)})}
                                type="checkbox" id="summer_year" checked={summerYear} label={`Summer ${row.lease_summer_year}`} inline/>
                                : <></>}
                        </Col>
                    </Row>
                </Form>
            </td>
        </tr>
    )
};

export const AssignedApplicationList = ({
                                            data,
                                            page,
                                            site,
                                            leaseId,
                                            handleWelcome,
                                            addResetHook
                                        }) => {

    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Apartment Number</th>
                    <th>Discount</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (
                    <AssignedRow page={page} site={site} row={row} leaseId={leaseId} handleWelcome={handleWelcome}
                                 addResetHook={addResetHook}/>
                ))}
                </tbody>
            </Table>
        </>
    );
};
export const WelcomedApplicationList = ({data, page, site, leaseId}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Welcome Sent Date</th>
                    <th>Semesters</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (
                    <WelcomedRow row={row} page={page} site={site} leaseId={leaseId} />))}
                </tbody>
            </Table>
        </>
    );
};
export const SignedLeaseList = ({data, page, site, leaseId}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Lease Signed Date</th>
                    <th>Semesters</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (
                    <WelcomedRow row={row} page={page} site={site} leaseId={leaseId} />))}
                </tbody>
            </Table>
        </>
    );
};

