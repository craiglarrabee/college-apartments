import {Button, Col, Form, Row, Table} from "react-bootstrap";
import {useForm} from "react-hook-form";
import React, {useEffect, useState} from "react";
import classNames from "classnames";


export const UnprocessedApplicationList = ({
                                               data,
                                               page,
                                               site,
                                               leaseId,
                                               handleDelete,
                                               handleProcess,
                                               ...restOfProps
                                           }) => {
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
                    <td><a href={`/${page}/${row.user_id}?site=${site}&roomTypeId=${row.room_type_id}`}>{row.name}</a>
                    </td>
                    <td>{row.submit_date}</td>
                    <td><Button onClick={(e) => handleProcess(row.user_id, site, leaseId, true)}>Process</Button></td>
                    <td><Button
                        onClick={(e) => handleDelete(row.user_id, site, leaseId, row.room_type_id)}>Delete</Button></td>
                </tr>))}
                </tbody>
            </Table>
        </>
    );
};
export const ProcessedApplicationList = ({
                                             data,
                                             page,
                                             site,
                                             leaseId,
                                             handleDelete,
                                             handleDeposit,
                                             handleProcess,
                                             ...restOfProps
                                         }) => {

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
                            <td><a
                                href={`/${page}/${row.user_id}?site=${site}&roomTypeId=${row.room_type_id}`}>{row.name}</a>
                            </td>
                            <td>{row.submit_date}</td>
                            <td><Button onClick={(e) => handleDeposit(row.user_id, site, leaseId)}>Deposit</Button></td>
                            <td><Button
                                onClick={(e) => handleProcess(row.user_id, site, leaseId, false)}>Unprocess</Button>
                            </td>
                            <td><Button
                                onClick={(e) => handleDelete(row.user_id, site, leaseId, row.room_type_id)}>Delete</Button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
        </>
    );
};
export const DepositReceivedApplicationList = ({data, page, site, leaseId, ...restOfProps}) => {
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
                    <td><a href={`/${page}/${row.user_id}?site=${site}&roomTypeId=${row.room_type_id}`}>{row.name}</a>
                    </td>
                    <td>{row.deposit_date}</td>
                </tr>))}
                </tbody>
            </Table>
        </>
    );
};


export const AssignedRow = ({page, site, row, leaseId, handleWelcome, addResetHook, ...restOfProps}) => {
    const {register, formState: {errors}, handleSubmit, reset} = useForm();
    addResetHook(row.user_id, reset);
    return (
        <tr>
            <td><a href={`/${page}/${row.user_id}?site=${site}&roomTypeId=${row.room_type_id}`}>{row.name}</a></td>
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


export const WelcomedRow = ({page, site, row, leaseId, handleDelete, ...restOfProps}) => {
    const [semester1Selected, setSemester1Selected] = useState(row.semester1_selected);
    const [semester2Selected, setSemester2Selected] = useState(row.semester2_selected);
    const {register} = useForm();

    useEffect(() => {
        saveTenantSemesters({
            semesters: [{value: row.semester1, selected: semester1Selected}, {
                value: row.semester2,
                selected: semester2Selected
            }]
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semester1Selected, semester2Selected]);

    const saveTenantSemesters = async (data) => {
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${row.user_id}/leases/${leaseId}/tenant?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <tr>
            <td><a href={`/${page}/${row.user_id}?site=${site}&roomTypeId=${row.room_type_id}`}>{row.name}</a></td>
            <td>{row.lease_date}</td>
            <td>
                <Form method="post">
                    <Row>
                        <Col>
                            {row.semester1 ?
                                <Form.Check
                                    className="mb-3" {...register("semester1", {onChange: (e) => setSemester1Selected(e.target.checked)})}
                                    type="checkbox" id="semester1" checked={semester1Selected} label={row.semester1}
                                    inline/>
                                : <></>}
                            {row.semester2 ?
                                <Form.Check
                                    className="mb-3" {...register("semester2", {onChange: (e) => setSemester2Selected(e.target.checked)})}
                                    type="checkbox" id="semester2" checked={semester2Selected} label={row.semester2}
                                    inline/>
                                : <></>}
                        </Col>
                        {handleDelete && <td><Button
                            onClick={(e) => handleDelete(row.user_id, site, leaseId, row.room_type_id)}>Delete</Button>
                        </td>}

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
                                            , ...restOfProps
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
export const WelcomedApplicationList = ({data, page, site, leaseId, handleDelete, ...restOfProps}) => {
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
                    <WelcomedRow row={row} page={page} site={site} leaseId={leaseId} handleDelete={handleDelete}/>))}
                </tbody>
            </Table>
        </>
    );
};
export const SignedLeaseList = ({data, page, site, leaseId, ...restOfProps}) => {
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
                    <WelcomedRow row={row} page={page} site={site} leaseId={leaseId}/>))}
                </tbody>
            </Table>
        </>
    );
};

