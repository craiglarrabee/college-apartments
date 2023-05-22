import {Button, Col, Form, Row, Table} from "react-bootstrap";
import {useForm} from "react-hook-form";
import React from "react";
import classNames from "classnames";
import {add} from "@dnd-kit/utilities";


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
                {data.map(row => (<tr>
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
                        <tr>
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


export const WelcomeRow = ({page, site, row, leaseId, handleWelcome, addResetHook}) => {
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
                        <div className={classNames("col-1")} style={{maxWidth: "5px"}} >$</div>
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

export const AssignedApplicationList = ({data, page, site, leaseId, handleWelcome, addResetHook}) => {
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
                    <WelcomeRow page={page} site={site} row={row} leaseId={leaseId} handleWelcome={handleWelcome} addResetHook={addResetHook} ></WelcomeRow>
                ))}
                </tbody>
            </Table>
        </>
    );
};


export const SentLeaseList = ({data, page, site}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Welcome Sent Date</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr>
                    <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
                    <td>{row.lease_date}</td>
                </tr>))}
                </tbody>
            </Table>
        </>
    );
};
export const SignedLeaseList = ({data, page, site}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Lease Signed Date</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr>
                    <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
                    <td>{row.signed_date}</td>
                </tr>))}
                </tbody>
            </Table>
        </>
    );
};