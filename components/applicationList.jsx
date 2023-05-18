import {Button, Table} from "react-bootstrap";

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
                            <td><Button onClick={(e) => handleProcess(row.user_id, site, leaseId, false)}>Unprocess</Button></td>
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
export const AssignedApplicationList = ({data, page, site, leaseId, handleWelcome}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Apartment Number</th>
                    <th>Discount</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr>
                    <td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td>
                    <td>{row.apartment_number}</td>
                    <td></td>
                    <td><Button onClick={(e) => handleWelcome(row.user_id, site, leaseId)}>Welcome</Button></td>
                </tr>))}
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
                    <th>Lease Sent Date</th>
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