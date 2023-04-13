import {Table} from "react-bootstrap";


export const ApplicationList = ({data, page}) => {
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
                {data.map(row => (<tr><td><a href={`/${page}/${row.user_id}`}>{row.name}</a></td><td>{row.submit_date}</td></tr>))}
                </tbody>
            </Table>
        </>
    );
}