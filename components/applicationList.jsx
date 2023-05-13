import {Table} from "react-bootstrap";


export const UnprocessedApplicationList = ({data, page, site}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Application Date</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr><td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td><td>{row.submit_date}</td></tr>))}
                </tbody>
            </Table>
        </>
    );
};
export const ProcessedApplicationList = ({data, page, site}) => {
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>Tenant</th>
                    <th>Application Date</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr><td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td><td>{row.submit_date}</td></tr>))}
                </tbody>
            </Table>
        </>
    );
};
export const DepositReceivedApplicationList = ({data, page, site}) => {
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
                {data.map(row => (<tr><td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td><td>{row.deposit_date}</td></tr>))}
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
                {data.map(row => (<tr><td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td><td>{row.lease_date}</td></tr>))}
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
                {data.map(row => (<tr><td><a href={`/${page}/${row.user_id}?site=${site}`}>{row.name}</a></td><td>{row.signed_date}</td></tr>))}
                </tbody>
            </Table>
        </>
    );
};